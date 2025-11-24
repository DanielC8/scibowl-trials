import { Subject } from '../types';
import Tesseract from 'tesseract.js';

// Hack Club AI API configuration
const AI_API_URL = 'https://ai.hackclub.com/proxy/v1/chat/completions';
const AI_API_KEY = 'sk-hc-v1-9cb6526ecdc7469a8d182d186f7b9c05011fffa375964a50903aa7520c2a3049';

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
}

/**
 * Use AI to categorize problem type based on text content
 */
export async function categorizeProblemType(
  text: string,
  subject: Subject
): Promise<string | null> {
  if (!text || text.length < 20) {
    return null; // Not enough text to categorize
  }

  const subjectCategories = {
    physics: [
      'Kinematics',
      'Dynamics/Forces',
      'Energy/Work',
      'Momentum',
      'Rotational Motion',
      'Gravity',
      'Waves',
      'Sound',
      'Optics/Light',
      'Electricity/Circuits',
      'Magnetism',
      'Electromagnetism',
      'Modern Physics/Quantum',
      'Thermodynamics',
      'Fluids',
      'Simple Machines',
    ],
    biology: [
      'Cell Biology',
      'Genetics',
      'Evolution',
      'Ecology',
      'Anatomy/Physiology',
      'Molecular Biology',
      'Biochemistry',
      'Microbiology',
      'Botany',
      'Zoology',
      'Taxonomy',
      'Biomes/Ecosystems',
    ],
    chemistry: [
      'Atomic Structure',
      'Chemical Bonding',
      'Stoichiometry',
      'Acids/Bases',
      'Redox Reactions',
      'Thermochemistry',
      'Kinetics',
      'Equilibrium',
      'Solutions',
      'Organic Chemistry',
      'Nuclear Chemistry',
      'Periodic Table',
    ],
    'earth-science': [
      'Geology/Rocks',
      'Plate Tectonics',
      'Earthquakes/Volcanoes',
      'Weathering/Erosion',
      'Meteorology/Weather',
      'Oceanography',
      'Astronomy/Solar System',
      'Stars/Galaxies',
      'Earth History',
      'Minerals',
      'Fossils',
      'Climate',
    ],
  };

  const categories = subjectCategories[subject] || [];
  
  const prompt = `You are a Science Bowl expert. Analyze this science problem and categorize it into ONE of the following categories for ${subject}:

Categories: ${categories.join(', ')}

Problem text:
${text.substring(0, 500)}

Respond with ONLY the category name, nothing else. If it doesn't fit any category well, respond with "General".`;

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const category = data.choices?.[0]?.message?.content?.trim();
    
    // Validate that the response is one of our categories
    if (category && (categories.includes(category) || category === 'General')) {
      return category;
    }

    return null;
  } catch (error) {
    console.error('AI categorization error:', error);
    return null;
  }
}

/**
 * Process image: extract text and categorize
 */
export async function analyzeImage(
  imageUrl: string,
  subject: Subject
): Promise<{ text: string; problemType: string | null }> {
  console.log(`Analyzing image for ${subject}...`);
  
  // Extract text using OCR
  const text = await extractTextFromImage(imageUrl);
  console.log(`Extracted ${text.length} characters of text`);
  
  // Categorize using AI
  const problemType = await categorizeProblemType(text, subject);
  console.log(`Categorized as: ${problemType || 'Unknown'}`);
  
  return { text, problemType };
}
