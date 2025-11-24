export type Subject = 'physics' | 'earth-science' | 'biology' | 'chemistry';
export type QuestionType = 'toss-up' | 'bonus';

export interface Problem {
  id: string;
  subject: Subject;
  imageUrl: string;
  fileName: string;
  answer?: string;
  roundNumber?: number; // Round 1-16
  questionNumber?: number;
  questionType?: QuestionType; // toss-up or bonus
  problemType?: string; // e.g., "kinematics", "circuits", "thermodynamics"
}

export interface ProblemBank {
  physics: Problem[];
  'earth-science': Problem[];
  biology: Problem[];
  chemistry: Problem[];
}

export interface SubjectRatio {
  subject: Subject;
  ratio: number;
}

export interface GenerationConfig {
  mode: 'single' | 'mixed';
  count: number;
  subject?: Subject;
  ratios?: SubjectRatio[];
  roundNumbers?: number[]; // Filter by specific round numbers
}
