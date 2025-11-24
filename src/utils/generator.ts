import { Problem, ProblemBank, GenerationConfig, Subject } from '../types';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a problem set based on the configuration
 * Selects problems with uniform distribution across rounds
 */
export function generateProblemSet(
  problemBank: ProblemBank,
  config: GenerationConfig
): Problem[] {
  if (config.mode === 'single') {
    return generateSingleSubject(problemBank, config.subject!, config.count, config.roundNumbers);
  } else {
    return generateMixedSubjects(problemBank, config.ratios!, config.count, config.roundNumbers);
  }
}

/**
 * Filter problems by round numbers
 */
function filterByRoundNumbers(problems: Problem[], roundNumbers?: number[]): Problem[] {
  if (!roundNumbers || roundNumbers.length === 0) {
    return problems;
  }
  return problems.filter(p => p.roundNumber && roundNumbers.includes(p.roundNumber));
}

/**
 * Select problems with uniform distribution across rounds
 * Ensures roughly equal number of problems from each round, then shuffles for random order
 */
function selectUniformByRound(problems: Problem[], count: number): Problem[] {
  if (problems.length === 0) return [];
  
  // Group problems by round
  const byRound = new Map<number, Problem[]>();
  for (const problem of problems) {
    const round = problem.roundNumber || 0;
    if (!byRound.has(round)) {
      byRound.set(round, []);
    }
    byRound.get(round)!.push(problem);
  }
  
  // Shuffle each round's problems
  for (const [round, probs] of byRound.entries()) {
    byRound.set(round, shuffleArray(probs));
  }
  
  // Select problems round-robin style for uniform distribution
  const result: Problem[] = [];
  const roundsList = Array.from(byRound.values());
  let roundIndex = 0;
  
  while (result.length < count && roundsList.some(probs => probs.length > 0)) {
    const roundProbs = roundsList[roundIndex % roundsList.length];
    
    if (roundProbs.length > 0) {
      result.push(roundProbs.shift()!);
    }
    
    roundIndex++;
  }
  
  // Shuffle final result for random order while maintaining uniform distribution
  return shuffleArray(result);
}

/**
 * Generate problems from a single subject with uniform round distribution
 */
function generateSingleSubject(
  problemBank: ProblemBank,
  subject: Subject,
  count: number,
  roundNumbers?: number[]
): Problem[] {
  const problems = problemBank[subject];
  const filtered = filterByRoundNumbers(problems, roundNumbers);
  return selectUniformByRound(filtered, count);
}

/**
 * Generate mixed subject problems with specified ratios and uniform round distribution
 */
function generateMixedSubjects(
  problemBank: ProblemBank,
  ratios: { subject: Subject; ratio: number }[],
  count: number,
  roundNumbers?: number[]
): Problem[] {
  const result: Problem[] = [];
  const totalRatio = ratios.reduce((sum, r) => sum + r.ratio, 0);
  
  // Calculate how many problems needed from each subject
  for (const { subject, ratio } of ratios) {
    const subjectCount = Math.round((ratio / totalRatio) * count);
    let problems = problemBank[subject];
    problems = filterByRoundNumbers(problems, roundNumbers);
    const selected = selectUniformByRound(problems, subjectCount);
    result.push(...selected);
  }

  // Shuffle final result to mix subjects
  return shuffleArray(result.slice(0, count));
}
