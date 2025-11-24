import { ProblemBank, Subject } from '../types';

// Lazy load PDF.js to avoid initial load issues
let pdfjsLib: any = null;

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

/**
 * Keywords to identify each subject
 */
const subjectKeywords: Record<Subject, string[]> = {
  'physics': [
    'physics', 'force', 'energy', 'momentum', 'velocity', 'acceleration',
    'newton', 'joule', 'watt', 'mass', 'motion', 'thermodynamics',
    'electromagnetic', 'quantum', 'relativity', 'mechanics', 'optics',
    'kinetic', 'potential', 'friction', 'gravity', 'wave'
  ],
  'earth-science': [
    'earth science', 'geology', 'meteorology', 'oceanography', 'astronomy',
    'rock', 'mineral', 'atmosphere', 'climate', 'weather', 'tectonic',
    'volcano', 'earthquake', 'fossil', 'sediment', 'erosion', 'planet',
    'star', 'galaxy', 'solar system', 'ocean', 'tsunami', 'hurricane'
  ],
  'biology': [
    'biology', 'cell', 'organism', 'dna', 'rna', 'protein', 'enzyme',
    'photosynthesis', 'respiration', 'mitosis', 'meiosis', 'evolution',
    'genetics', 'ecology', 'species', 'population', 'ecosystem',
    'chromosome', 'gene', 'membrane', 'bacteria', 'virus', 'plant', 'animal'
  ],
  'chemistry': [
    'chemistry', 'atom', 'molecule', 'element', 'compound', 'reaction',
    'chemical', 'periodic', 'bond', 'acid', 'base', 'ph', 'ion',
    'electron', 'proton', 'neutron', 'oxidation', 'reduction',
    'catalyst', 'solution', 'mixture', 'organic', 'inorganic', 'mole'
  ],
};

/**
 * Extract subject from the problem text (e.g., "1) Physics - Multiple Choice")
 * Returns null for Math and Energy questions (to be skipped)
 */
function extractSubjectFromText(text: string): Subject | null {
  const subjectPatterns = [
    /\d+\)\s*(Physics|Earth\s+(?:and\s+)?Space|Earth\s+Science|Biology|Chemistry|Math|Energy)/i,
    /^(Physics|Earth\s+(?:and\s+)?Space|Earth\s+Science|Biology|Chemistry|Math|Energy)/i,
  ];

  for (const pattern of subjectPatterns) {
    const match = text.match(pattern);
    if (match) {
      const subjectText = match[1].toLowerCase().replace(/\s+/g, ' ');
      
      // Skip Math and Energy questions
      if (subjectText.includes('math') || subjectText.includes('energy')) {
        return null;
      }
      
      if (subjectText === 'physics') return 'physics';
      if (subjectText.includes('earth')) return 'earth-science';
      if (subjectText === 'biology') return 'biology';
      if (subjectText === 'chemistry') return 'chemistry';
    }
  }

  return null;
}

/**
 * Extract answer from the problem text (e.g., "ANSWER: X) -1")
 */
function extractAnswer(text: string): string | undefined {
  const answerPatterns = [
    /ANSWER:\s*([^\n]+)/i,
    /Answer:\s*([^\n]+)/i,
  ];

  for (const pattern of answerPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Extract round number from the problem text (e.g., "Round 4" or "ROUND 1")
 */
function extractRoundNumber(text: string): number | undefined {
  const patterns = [
    /ROUND\s*(\d+)/i,
    /Round\s*(\d+)/i,
    /round\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const roundNum = parseInt(match[1], 10);
      if (roundNum >= 1 && roundNum <= 16) {
        return roundNum;
      }
    }
  }

  return undefined;
}

/**
 * Extract question number from the problem text (e.g., "1) Physics")
 */
function extractQuestionNumber(text: string): number | undefined {
  const match = text.match(/^(\d+)\)/m);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Detect question boundaries in a PDF page based on TOSS-UP and BONUS headings
 * Returns array of { y: yPosition, yEnd: yEndPosition, text: questionText, questionNumber: number, questionType: 'toss-up' | 'bonus' }
 */
function detectQuestionBoundaries(textItems: any[]): Array<{ 
  y: number;
  yEnd?: number;
  text: string; 
  questionNumber?: number;
  questionType?: 'toss-up' | 'bonus';
}> {
  const boundaries: Array<{ 
    y: number;
    yEnd?: number;
    text: string; 
    questionNumber?: number;
    questionType?: 'toss-up' | 'bonus';
  }> = [];
  
  // Look for TOSS-UP or BONUS headings
  const tossUpPattern = /^TOSS-UP$/i;
  const bonusPattern = /^BONUS$/i;
  const separatorPattern = /^~+$/; // Wavy line separator
  
  for (let i = 0; i < textItems.length; i++) {
    const item = textItems[i];
    const str = item.str?.trim() || '';
    
    // Check if this is a TOSS-UP or BONUS heading
    const isTossUp = tossUpPattern.test(str);
    const isBonus = bonusPattern.test(str);
    
    if (isTossUp || isBonus) {
      const yPos = item.transform[5]; // Y position in PDF coordinates
      const questionType = isTossUp ? 'toss-up' : 'bonus';
      
      // Collect text from this heading through the next several items
      // This should capture the entire question and answer
      let questionText = '';
      let questionNumber: number | undefined;
      let endY: number | undefined;
      
      // Start from the next item after the heading
      for (let j = i + 1; j < Math.min(i + 100, textItems.length); j++) {
        const nextStr = textItems[j].str?.trim() || '';
        
        // Stop if we hit the next TOSS-UP or BONUS
        if (tossUpPattern.test(nextStr) || bonusPattern.test(nextStr)) {
          // Look backwards for a separator line before this heading
          for (let k = j - 1; k > i; k--) {
            const prevStr = textItems[k].str?.trim() || '';
            if (separatorPattern.test(prevStr)) {
              endY = textItems[k].transform[5];
              break;
            }
          }
          break;
        }
        
        questionText += ' ' + nextStr;
        
        // Try to extract question number from the collected text
        if (!questionNumber) {
          const qNumMatch = questionText.match(/(\d+)\)\s*(Physics|Earth|Biology|Chemistry|Math|Energy)/i);
          if (qNumMatch) {
            questionNumber = parseInt(qNumMatch[1], 10);
          }
        }
        
        // Also check if we've found an answer (marks end of question)
        if (questionText.includes('ANSWER:')) {
          // Continue a bit more to get the full answer, then stop
          if (questionText.split('ANSWER:').length > 1) {
            const afterAnswer = questionText.split('ANSWER:')[1];
            // If we have substantial text after ANSWER, we're done
            if (afterAnswer.trim().length > 20) {
              break;
            }
          }
        }
      }
      
      boundaries.push({
        y: yPos,
        yEnd: endY,
        text: questionText.trim(),
        questionNumber,
        questionType,
      });
    }
  }
  
  // Sort by Y position (descending, as PDF coordinates go bottom-to-top)
  boundaries.sort((a, b) => b.y - a.y);
  
  return boundaries;
}

/**
 * Detect subject based on text content (fallback method)
 * Returns null if Math or Energy is detected
 */
function detectSubject(text: string): Subject | null {
  const lowerText = text.toLowerCase();
  
  // Check for Math or Energy first - if found, return null to skip
  if (lowerText.includes('math') || lowerText.includes('energy')) {
    return null;
  }
  
  const scores: Record<Subject, number> = {
    'physics': 0,
    'earth-science': 0,
    'biology': 0,
    'chemistry': 0,
  };

  // Count keyword matches for each subject
  (Object.keys(subjectKeywords) as Subject[]).forEach((subject) => {
    subjectKeywords[subject].forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        scores[subject] += matches.length;
      }
    });
  });

  // Find subject with highest score
  let maxScore = 0;
  let detectedSubject: Subject = 'physics';

  (Object.keys(scores) as Subject[]).forEach((subject) => {
    if (scores[subject] > maxScore) {
      maxScore = scores[subject];
      detectedSubject = subject;
    }
  });

  return detectedSubject;
}

/**
 * Parse PDF and categorize problems by subject
 */
export async function parsePDF(file: File): Promise<ProblemBank> {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  const result: ProblemBank = {
    'physics': [],
    'earth-science': [],
    'biology': [],
    'chemistry': [],
  };

  // Process each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // Get text content with position information
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    // Extract page-level metadata (round number applies to whole page)
    const roundNumber = extractRoundNumber(pageText);

    // Find question boundaries based on text positions
    const questionBoundaries = detectQuestionBoundaries(textContent.items);

    // Render full page to canvas
    const viewport = page.getViewport({ scale: 2.0 });
    const fullCanvas = document.createElement('canvas');
    const fullContext = fullCanvas.getContext('2d')!;
    fullCanvas.height = viewport.height;
    fullCanvas.width = viewport.width;

    await page.render({
      canvasContext: fullContext,
      viewport: viewport,
    }).promise;

    // If no clear boundaries found, treat whole page as one problem
    if (questionBoundaries.length === 0) {
      const imageUrl = fullCanvas.toDataURL('image/png');
      let subject = extractSubjectFromText(pageText);
      if (!subject) {
        subject = detectSubject(pageText);
        // Skip if still no valid subject (Math/Energy)
        if (!subject) {
          console.log(`Skipping page ${pageNum} - no valid subject detected`);
          continue;
        }
      }
      const answer = extractAnswer(pageText);
      const questionNumber = extractQuestionNumber(pageText);

      result[subject].push({
        id: `pdf-${file.name}-page-${pageNum}-${Date.now()}`,
        subject,
        imageUrl,
        fileName: `${file.name} - Page ${pageNum}`,
        answer,
        roundNumber,
        questionNumber,
      });
    } else {
      // Split page into individual questions
      for (let i = 0; i < questionBoundaries.length; i++) {
        const boundary = questionBoundaries[i];
        const nextBoundary = questionBoundaries[i + 1];
        
        // Calculate crop area (note: PDF Y coordinates go bottom-to-top, canvas goes top-to-bottom)
        // Since we sorted descending, boundary.y is higher up (smaller canvas Y)
        // Use yEnd if available (separator line), otherwise use next boundary
        const startY = boundary.yEnd || (nextBoundary ? nextBoundary.y : 0);
        const endY = boundary.y;
        const height = endY - startY;
        
        // Skip if height is invalid
        if (height <= 0) continue;

        // Create cropped canvas for this question
        const questionCanvas = document.createElement('canvas');
        questionCanvas.width = viewport.width;
        questionCanvas.height = height;
        const questionContext = questionCanvas.getContext('2d')!;

        // Copy the relevant section from full canvas
        // Need to invert Y since PDF coords are bottom-to-top but canvas is top-to-bottom
        const canvasStartY = viewport.height - endY;
        questionContext.drawImage(
          fullCanvas,
          0, canvasStartY,
          viewport.width, height,
          0, 0,
          viewport.width, height
        );

        const imageUrl = questionCanvas.toDataURL('image/png');
        
        // Extract metadata for this specific question
        const questionText = boundary.text;
        const questionNumber = boundary.questionNumber;
        const questionType = boundary.questionType;
        
        let subject = extractSubjectFromText(questionText);
        
        // Skip if subject is null (Math or Energy) or if we can't detect a valid subject
        if (!subject) {
          subject = detectSubject(questionText);
          // If still no valid subject or it's a math/energy question, skip this question
          if (!subject) {
            console.log(`Skipping question ${questionNumber} - invalid subject from text:`, questionText.substring(0, 100));
            continue;
          }
        }
        
        const answer = extractAnswer(questionText);

        result[subject].push({
          id: `pdf-${file.name}-page-${pageNum}-${questionType}-${questionNumber || i}-${Date.now()}`,
          subject,
          imageUrl,
          fileName: `${file.name} - ${questionType?.toUpperCase()} Q${questionNumber || i + 1}`,
          answer,
          roundNumber,
          questionNumber,
          questionType,
        });
      }
    }
  }

  return result;
}
