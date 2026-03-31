/**
 * Shared utility functions for the results feature area.
 *
 * Centralises grade/letter calculations, score formatting,
 * and display‑name helpers so they are consistent across
 * the results page, the student-results page, and future consumers.
 */

/**
 * Map a numeric average to a letter grade.
 *
 * Uses the school‑standard boundaries shared across both result pages.
 */
export function calculateGrade(average: number): string {
  if (average >= 80) return 'A';
  if (average >= 60) return 'B';
  if (average >= 50) return 'C';
  if (average >= 40) return 'D';
  return 'F';
}

/**
 * Return Tailwind CSS colour classes for a letter grade.
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100';
    case 'B': return 'text-blue-600 bg-blue-100';
    case 'C': return 'text-yellow-600 bg-yellow-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    default:  return 'text-red-600 bg-red-100';
  }
}

/**
 * Build a student's display name from their name parts.
 */
export function formatStudentName(
  firstName: string,
  middleName?: string | null,
  lastName?: string,
): string {
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
}

/**
 * Line shown under a result comment: full name when set, else staff ID, else a generic label.
 */
export function formatCommentAttribution(author: {
  name: string | null;
  teacherId: string | null;
}): string {
  const trimmed = author.name?.trim();
  if (trimmed) return trimmed;
  if (author.teacherId?.trim()) return `Staff ID: ${author.teacherId.trim()}`;
  return 'Teacher';
}
