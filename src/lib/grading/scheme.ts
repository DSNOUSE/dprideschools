/** @package dpride-school grading contract – single source of truth.
 *  Do not duplicate these values in pages, routes, or utils.
 *  Import from here instead.
 */

export const ASSESSMENT_SCHEME = [
  { key: 'firstScore',   name: 'CA 1',   maxScore: 10, weight: 10, order: 1 },
  { key: 'secondScore',  name: 'CA 2',   maxScore: 10, weight: 10, order: 2 },
  { key: 'examScore',    name: 'Exam',   maxScore: 80, weight: 80, order: 3 },
] as const;

/** Sum of CA1 + CA2 + Exam → percentage out of 100 */
export function computeTotal(scores: { firstScore?: number; secondScore?: number; examScore?: number }): number {
  return (scores.firstScore ?? 0) + (scores.secondScore ?? 0) + (scores.examScore ?? 0);
}

/** One canonical scale – use it everywhere (grade boundaries, exports, UI labels). */
export const GRADING_SCALE = {
  A: 80,
  B: 60,
  C: 50,
  D: 40,
  F: 0,
} as const;

/** Convert a numeric percentage (0–100) to a letter grade using GRADING_SCALE. */
export function letterGrade(percentage: number): string {
  if (percentage >= GRADING_SCALE.A) return 'A';
  if (percentage >= GRADING_SCALE.B) return 'B';
  if (percentage >= GRADING_SCALE.C) return 'C';
  if (percentage >= GRADING_SCALE.D) return 'D';
  return 'F';
}