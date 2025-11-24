import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Shuffle, Plus, Trash2, Download, Cloud } from 'lucide-react';
import { Button } from './components/Button';
import { Card, CardContent, CardHeader, CardTitle } from './components/Card';
import { Problem, ProblemBank, Subject, SubjectRatio } from './types';
import { generateProblemSet } from './utils/generator';
import { 
  initializeGoogleDrive, 
  signIn, 
  signOut, 
  selectFolder, 
  importFromGoogleDrive,
  GoogleDriveImportProgress 
} from './utils/googleDrive';

// Lazy import PDF parser to avoid blocking initial load
const parsePDF = async (file: File) => {
  const { parsePDF: parser } = await import('./utils/pdfParser');
  return parser(file);
};

const subjectLabels: Record<Subject, string> = {
  'physics': 'Physics',
  'earth-science': 'Earth Science',
  'biology': 'Biology',
  'chemistry': 'Chemistry',
};

const subjectColors: Record<Subject, string> = {
  'physics': 'bg-blue-500',
  'earth-science': 'bg-green-500',
  'biology': 'bg-purple-500',
  'chemistry': 'bg-orange-500',
};

function App() {
  const [problemBank, setProblemBank] = useState<ProblemBank>({
    physics: [],
    'earth-science': [],
    biology: [],
    chemistry: [],
  });

  const [generatedProblems, setGeneratedProblems] = useState<Problem[]>([]);
  const [mode, setMode] = useState<'single' | 'mixed'>('single');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('physics');
  const [problemCount, setProblemCount] = useState<number>(15);
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]); // Empty = all rounds
  const [ratios, setRatios] = useState<SubjectRatio[]>([
    { subject: 'physics', ratio: 2 },
    { subject: 'biology', ratio: 1 },
  ]);
  const [previewProblem, setPreviewProblem] = useState<Problem | null>(null);
  const [isGoogleDriveReady, setIsGoogleDriveReady] = useState(false);
  const [isGoogleDriveSignedIn, setIsGoogleDriveSignedIn] = useState(false);
  const [importProgress, setImportProgress] = useState<GoogleDriveImportProgress | null>(null);

  // File input refs for each subject
  const fileInputRefs = useRef<Record<Subject, HTMLInputElement | null>>({
    physics: null,
    'earth-science': null,
    biology: null,
    chemistry: null,
  });
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Drive API on mount
  useEffect(() => {
    console.log('🚀 App mounted, initializing Google Drive...');
    initializeGoogleDrive().then((ready) => {
      console.log('📊 Google Drive ready status:', ready);
      setIsGoogleDriveReady(ready);
      if (!ready) {
        console.error('⚠️ Google Drive initialization failed - check console for errors');
      }
    }).catch((error) => {
      console.error('❌ Google Drive init exception:', error);
      setIsGoogleDriveReady(false);
    });
  }, []);

  const handleImageUpload = async (subject: Subject, files: FileList | null) => {
    if (!files) return;

    const newProblems: Problem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = URL.createObjectURL(file);
      newProblems.push({
        id: `${subject}-${Date.now()}-${i}`,
        subject,
        imageUrl,
        fileName: file.name,
      });
    }

    setProblemBank((prev) => ({
      ...prev,
      [subject]: [...prev[subject], ...newProblems],
    }));
  };

  const handlePDFUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const categorizedProblems = await parsePDF(file);
        setProblemBank((prev) => ({
          physics: [...prev.physics, ...categorizedProblems.physics],
          'earth-science': [...prev['earth-science'], ...categorizedProblems['earth-science']],
          biology: [...prev.biology, ...categorizedProblems.biology],
          chemistry: [...prev.chemistry, ...categorizedProblems.chemistry],
        }));
        alert(`Successfully imported ${file.name}!`);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        alert(`Error parsing PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try uploading images instead.`);
      }
    }
  };

  const generateSet = () => {
    const config = {
      mode,
      count: problemCount,
      subject: mode === 'single' ? selectedSubject : undefined,
      ratios: mode === 'mixed' ? ratios : undefined,
      roundNumbers: selectedRounds.length > 0 ? selectedRounds : undefined,
    };

    const generated = generateProblemSet(problemBank, config);
    setGeneratedProblems(generated);
  };

  const deleteProblem = (subject: Subject, id: string) => {
    setProblemBank((prev) => ({
      ...prev,
      [subject]: prev[subject].filter((p) => p.id !== id),
    }));
  };

  const addRatio = () => {
    const unusedSubjects = (['physics', 'earth-science', 'biology', 'chemistry'] as Subject[]).filter(
      (s) => !ratios.some((r) => r.subject === s)
    );
    if (unusedSubjects.length > 0) {
      setRatios([...ratios, { subject: unusedSubjects[0], ratio: 1 }]);
    }
  };

  const removeRatio = (index: number) => {
    setRatios(ratios.filter((_, i) => i !== index));
  };

  const updateRatio = (index: number, field: 'subject' | 'ratio', value: Subject | number) => {
    const newRatios = [...ratios];
    newRatios[index] = { ...newRatios[index], [field]: value };
    setRatios(newRatios);
  };

  const toggleRound = (roundNum: number) => {
    setSelectedRounds(prev => 
      prev.includes(roundNum) 
        ? prev.filter(r => r !== roundNum)
        : [...prev, roundNum].sort((a, b) => a - b)
    );
  };

  const handleGoogleDriveSignIn = async () => {
    const success = await signIn();
    setIsGoogleDriveSignedIn(success);
    if (success) {
      alert('✅ Successfully signed in to Google Drive!\n\nNext step: Click "Import from Google Drive" to select your folder.');
    } else {
      alert('❌ Sign-in failed. Check the browser console for errors.');
    }
  };

  const handleGoogleDriveSignOut = () => {
    signOut();
    setIsGoogleDriveSignedIn(false);
  };

  const handleGoogleDriveImport = async () => {
    try {
      const folderId = await selectFolder();
      if (!folderId) return;

      setImportProgress({ total: 0, current: 0, currentFile: 'Starting...' });

      const importedProblems = await importFromGoogleDrive(folderId, (progress) => {
        setImportProgress(progress);
      });

      // Merge imported problems with existing bank
      setProblemBank((prev) => ({
        physics: [...prev.physics, ...importedProblems.physics],
        'earth-science': [...prev['earth-science'], ...importedProblems['earth-science']],
        biology: [...prev.biology, ...importedProblems.biology],
        chemistry: [...prev.chemistry, ...importedProblems.chemistry],
      }));

      setImportProgress(null);
      alert(`Successfully imported ${
        importedProblems.physics.length +
        importedProblems['earth-science'].length +
        importedProblems.biology.length +
        importedProblems.chemistry.length
      } problems from Google Drive!`);
    } catch (error) {
      console.error('Google Drive import error:', error);
      alert('Failed to import from Google Drive. Please try again.');
      setImportProgress(null);
    }
  };

  const downloadSet = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Science Bowl Problem Set</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .problem { margin-bottom: 40px; page-break-inside: avoid; }
    .problem-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .problem-number { font-weight: bold; font-size: 18px; }
    .subject-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
    .round-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: #e5e7eb; color: #374151; font-size: 12px; }
    .answer { margin-top: 15px; padding: 10px; background-color: #f3f4f6; border-left: 3px solid #3b82f6; }
    .answer-label { font-weight: bold; color: #1f2937; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Science Bowl Problem Set</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Total Problems: ${generatedProblems.length}</p>
  ${selectedRounds.length > 0 ? `<p>Filtered Rounds: ${selectedRounds.join(', ')}</p>` : ''}
  <hr>
  ${generatedProblems.map((problem, index) => `
    <div class="problem">
      <div class="problem-header">
        <span class="problem-number">Problem ${index + 1}</span>
        ${problem.questionType ? `<span class="round-badge" style="background-color: ${problem.questionType === 'toss-up' ? '#c084fc' : '#fbbf24'}; color: white;">${problem.questionType === 'toss-up' ? 'TOSS-UP' : 'BONUS'}</span>` : ''}
        ${problem.roundNumber ? `<span class="round-badge">Round ${problem.roundNumber}</span>` : ''}
        <span class="subject-badge" style="background-color: ${
          problem.subject === 'physics' ? '#3b82f6' :
          problem.subject === 'earth-science' ? '#22c55e' :
          problem.subject === 'biology' ? '#a855f7' : '#f97316'
        }">
          ${subjectLabels[problem.subject]}
        </span>
      </div>
      <img src="${problem.imageUrl}" alt="${problem.fileName}" />
      ${problem.answer ? `
        <div class="answer">
          <span class="answer-label">Answer:</span> ${problem.answer}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `science-bowl-set-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Science Bowl Trials</h1>
          <p className="text-gray-600">Generate randomized problem sets with custom ratios</p>
        </header>

        {/* Preview Modal */}
        {previewProblem && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewProblem(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded text-white text-sm ${subjectColors[previewProblem.subject]}`}>
                    {subjectLabels[previewProblem.subject]}
                  </span>
                  {previewProblem.questionType && (
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      previewProblem.questionType === 'toss-up' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {previewProblem.questionType === 'toss-up' ? 'TOSS-UP' : 'BONUS'}
                    </span>
                  )}
                  {previewProblem.roundNumber && (
                    <span className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm">
                      Round {previewProblem.roundNumber}
                    </span>
                  )}
                  {previewProblem.questionNumber && (
                    <span className="text-sm text-gray-600">
                      Q#{previewProblem.questionNumber}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setPreviewProblem(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Navigation hints */}
              {(() => {
                const currentBank = problemBank[previewProblem.subject];
                const currentIndex = currentBank.findIndex(p => p.id === previewProblem.id);
                const hasPrev = currentIndex > 0;
                const hasNext = currentIndex < currentBank.length - 1;
                
                return (currentBank.length > 1) && (
                  <div className="flex justify-between mb-3">
                    <button
                      onClick={() => hasPrev && setPreviewProblem(currentBank[currentIndex - 1])}
                      disabled={!hasPrev}
                      className={`px-3 py-1 text-sm rounded ${hasPrev ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      ← Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} / {currentBank.length}
                    </span>
                    <button
                      onClick={() => hasNext && setPreviewProblem(currentBank[currentIndex + 1])}
                      disabled={!hasNext}
                      className={`px-3 py-1 text-sm rounded ${hasNext ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Next →
                    </button>
                  </div>
                );
              })()}
              
              <img 
                src={previewProblem.imageUrl} 
                alt={previewProblem.fileName}
                className="w-full border rounded mb-4"
              />
              {previewProblem.answer && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <span className="font-semibold text-gray-700">Answer: </span>
                  <span className="text-gray-900">{previewProblem.answer}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">{previewProblem.fileName}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Problem Bank Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Problem Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Object.keys(problemBank) as Subject[]).map((subject) => (
                  <div key={subject} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${subjectColors[subject]}`} />
                        <h3 className="font-semibold">{subjectLabels[subject]}</h3>
                        <span className="text-sm text-gray-500">
                          ({problemBank[subject].length} problems)
                        </span>
                      </div>
                      <div>
                        <input
                          ref={(el) => fileInputRefs.current[subject] = el}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(subject, e.target.files)}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          type="button"
                          onClick={() => fileInputRefs.current[subject]?.click()}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Images
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {problemBank[subject].slice(0, 4).map((problem) => (
                        <div key={problem.id} className="relative group">
                          <img
                            src={problem.imageUrl}
                            alt={problem.fileName}
                            className="w-full h-20 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                            onClick={() => setPreviewProblem(problem)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProblem(subject, problem.id);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {problemBank[subject].length > 4 && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          +{problemBank[subject].length - 4} more problems
                        </p>
                        <button
                          onClick={() => setPreviewProblem(problemBank[subject][0])}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View All
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t space-y-3">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handlePDFUpload(e.target.files)}
                  />
                  <Button 
                    className="w-full" 
                    variant="secondary" 
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Upload PDF (Auto-Categorize)
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Automatically detect and categorize problems by subject and round
                  </p>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2 text-center">Or Import from Google Drive</p>
                    {isGoogleDriveReady === false ? (
                      <div className="text-center">
                        <p className="text-xs text-red-500 mb-2">Google Drive failed to load</p>
                        <p className="text-xs text-gray-500">Check console for errors</p>
                        <Button 
                          className="w-full mt-2" 
                          variant="outline" 
                          size="sm"
                          type="button"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : isGoogleDriveReady === undefined || !isGoogleDriveReady ? (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Loading Google Drive...</p>
                        <p className="text-xs text-gray-400 mt-1">Check browser console if stuck</p>
                      </div>
                    ) : !isGoogleDriveSignedIn ? (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        type="button"
                        onClick={handleGoogleDriveSignIn}
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Sign in to Google Drive
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                          <p className="text-xs text-green-700 font-medium">✅ Signed in to Google Drive</p>
                          <p className="text-xs text-green-600">Ready to import problems</p>
                        </div>
                        <Button 
                          className="w-full" 
                          variant="default" 
                          type="button"
                          onClick={handleGoogleDriveImport}
                          disabled={!!importProgress}
                        >
                          <Cloud className="w-4 h-4 mr-2" />
                          {importProgress ? 'Importing...' : 'Select Folder & Import'}
                        </Button>
                        {importProgress && (
                          <div className="text-xs text-gray-600 text-center">
                            <p className="font-medium">📥 Importing: {importProgress.current} / {importProgress.total}</p>
                            <p className="text-gray-500 truncate">{importProgress.currentFile}</p>
                          </div>
                        )}
                        <Button 
                          className="w-full" 
                          variant="outline" 
                          size="sm"
                          type="button"
                          onClick={handleGoogleDriveSignOut}
                        >
                          Sign Out
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Organize: Topic Folders → Round Folders → Images
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="w-6 h-6" />
                Generate Problem Set
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mode</label>
                  <div className="flex gap-2">
                    <Button
                      variant={mode === 'single' ? 'default' : 'outline'}
                      onClick={() => setMode('single')}
                      className="flex-1"
                    >
                      Single Subject
                    </Button>
                    <Button
                      variant={mode === 'mixed' ? 'default' : 'outline'}
                      onClick={() => setMode('mixed')}
                      className="flex-1"
                    >
                      Mixed Subjects
                    </Button>
                  </div>
                </div>

                {mode === 'single' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                      className="w-full p-2 border rounded-md"
                    >
                      {(Object.keys(problemBank) as Subject[]).map((subject) => (
                        <option key={subject} value={subject}>
                          {subjectLabels[subject]} ({problemBank[subject].length} available)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mode === 'mixed' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject Ratios</label>
                    <div className="space-y-2">
                      {ratios.map((ratio, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <select
                            value={ratio.subject}
                            onChange={(e) => updateRatio(index, 'subject', e.target.value as Subject)}
                            className="flex-1 p-2 border rounded-md"
                          >
                            {(Object.keys(problemBank) as Subject[]).map((subject) => (
                              <option key={subject} value={subject}>
                                {subjectLabels[subject]}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={ratio.ratio}
                            onChange={(e) => updateRatio(index, 'ratio', parseInt(e.target.value) || 1)}
                            className="w-20 p-2 border rounded-md"
                          />
                          {ratios.length > 1 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeRatio(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {ratios.length < 4 && (
                        <Button size="sm" variant="outline" onClick={addRatio} className="w-full">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Subject
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Filter by Rounds {selectedRounds.length > 0 && `(${selectedRounds.length} selected)`}
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((roundNum) => (
                      <button
                        key={roundNum}
                        onClick={() => toggleRound(roundNum)}
                        className={`p-2 text-sm rounded border transition-colors ${
                          selectedRounds.includes(roundNum)
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {roundNum}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedRounds.length === 0 
                      ? 'All rounds selected (click numbers to filter)' 
                      : 'Click again to deselect'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Problems: {problemCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={problemCount}
                    onChange={(e) => setProblemCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <Button onClick={generateSet} className="w-full" size="lg">
                  <Shuffle className="w-5 h-5 mr-2" />
                  Generate Problem Set
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Problems Display */}
        {generatedProblems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Problem Set ({generatedProblems.length} problems)</CardTitle>
                <Button onClick={downloadSet} variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download as HTML
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedProblems.map((problem, index) => (
                  <div key={`${problem.id}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">#{index + 1}</span>
                        {problem.questionType && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            problem.questionType === 'toss-up' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {problem.questionType === 'toss-up' ? 'T' : 'B'}
                          </span>
                        )}
                        {problem.roundNumber && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                            R{problem.roundNumber}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded text-white ${subjectColors[problem.subject]}`}>
                        {subjectLabels[problem.subject]}
                      </span>
                    </div>
                    <img
                      src={problem.imageUrl}
                      alt={problem.fileName}
                      className="w-full h-48 object-contain border rounded mb-2"
                    />
                    {problem.answer && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs font-semibold text-gray-600">Answer: </span>
                        <span className="text-xs text-gray-800">{problem.answer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
