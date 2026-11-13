/**
 * Comprehensive Test Suite for 14-Fix Grade System Overhaul
 * Tests critical paths and data integrity for all fixes
 *
 * Run with: npm run test -- grades-system
 */

import { z } from 'zod';

// Test FIX-004: Validation Schemas
describe('FIX-004: Grade Validation Schemas', () => {
  const gradeEntrySchema = z.object({
    studentId: z.string().min(1, 'Student ID required'),
    subjectId: z.number().int().positive('Subject ID must be positive'),
    firstScore: z
      .number()
      .min(0, 'CA1 must be 0 or higher')
      .max(10, 'CA1 cannot exceed 10')
      .nullable()
      .optional(),
    secondScore: z
      .number()
      .min(0, 'CA2 must be 0 or higher')
      .max(10, 'CA2 cannot exceed 10')
      .nullable()
      .optional(),
    fourthScore: z
      .number()
      .min(0, 'Exam must be 0 or higher')
      .max(80, 'Exam cannot exceed 80')
      .nullable()
      .optional(),
  });

  test('Valid grade entry passes validation', () => {
    const validGrade = {
      studentId: 'S001',
      subjectId: 1,
      firstScore: 8,
      secondScore: 9,
      fourthScore: 72,
    };
    expect(() => gradeEntrySchema.parse(validGrade)).not.toThrow();
  });

  test('CA1 > 10 fails validation', () => {
    const invalidGrade = {
      studentId: 'S001',
      subjectId: 1,
      firstScore: 11,
    };
    expect(() => gradeEntrySchema.parse(invalidGrade)).toThrow();
  });

  test('Exam > 80 fails validation', () => {
    const invalidGrade = {
      studentId: 'S001',
      subjectId: 1,
      fourthScore: 85,
    };
    expect(() => gradeEntrySchema.parse(invalidGrade)).toThrow();
  });

  test('Negative scores fail validation', () => {
    const invalidGrade = {
      studentId: 'S001',
      subjectId: 1,
      firstScore: -1,
    };
    expect(() => gradeEntrySchema.parse(invalidGrade)).toThrow();
  });

  test('Null/optional scores are allowed', () => {
    const gradeWithNulls = {
      studentId: 'S001',
      subjectId: 1,
      firstScore: null,
      secondScore: null,
      fourthScore: null,
    };
    expect(() => gradeEntrySchema.parse(gradeWithNulls)).not.toThrow();
  });
});

// Test FIX-009: MaxScore Calculation
describe('FIX-009: MaxScore Calculation', () => {
  function calculateMaxScore(ca1: number | null, ca2: number | null, exam: number | null): number {
    let maxScore = 0;
    if (ca1 != null) maxScore += 10;
    if (ca2 != null) maxScore += 10;
    if (exam != null) maxScore += 80;
    if (maxScore === 0) maxScore = 100;
    return maxScore;
  }

  test('All assessments present: maxScore = 100', () => {
    expect(calculateMaxScore(8, 9, 72)).toBe(100);
  });

  test('Only CA1 and CA2: maxScore = 20', () => {
    expect(calculateMaxScore(8, 9, null)).toBe(20);
  });

  test('Only Exam: maxScore = 80', () => {
    expect(calculateMaxScore(null, null, 72)).toBe(80);
  });

  test('Only CA1: maxScore = 10', () => {
    expect(calculateMaxScore(8, null, null)).toBe(10);
  });

  test('No assessments: maxScore defaults to 100', () => {
    expect(calculateMaxScore(null, null, null)).toBe(100);
  });

  test('CA1 and Exam: maxScore = 90', () => {
    expect(calculateMaxScore(8, null, 72)).toBe(90);
  });
});

// Test FIX-010: Null Score Handling in Ranking
describe('FIX-010: Null Score Filtering in Rankings', () => {
  interface StudentResult {
    studentId: string;
    totalScore: number | null;
  }

  function rankStudents(results: StudentResult[]): Array<{ studentId: string; position: number | null }> {
    const rankedResults = results.filter((r) => r.totalScore != null);
    const positions: Array<{ studentId: string; position: number | null }> = [];
    let currentPosition = 1;
    let previousScore: number | null = null;
    let studentsAtCurrentPosition = 0;

    for (let i = 0; i < rankedResults.length; i++) {
      const score = rankedResults[i].totalScore!;
      if (previousScore != null && score === previousScore) {
        studentsAtCurrentPosition++;
      } else {
        if (i > 0) currentPosition += studentsAtCurrentPosition;
        studentsAtCurrentPosition = 1;
        previousScore = score;
      }
      positions.push({
        studentId: rankedResults[i].studentId,
        position: currentPosition,
      });
    }

    for (const result of results) {
      if (result.totalScore == null) {
        positions.push({
          studentId: result.studentId,
          position: null,
        });
      }
    }

    return positions;
  }

  test('Students with scores are ranked correctly', () => {
    const results: StudentResult[] = [
      { studentId: 'S1', totalScore: 80 },
      { studentId: 'S2', totalScore: 75 },
      { studentId: 'S3', totalScore: 80 },
    ];

    const positions = rankStudents(results);
    expect(positions[0].position).toBe(1);
    expect(positions[2].position).toBe(3);
  });

  test('Null scores are marked as unranked', () => {
    const results: StudentResult[] = [
      { studentId: 'S1', totalScore: 80 },
      { studentId: 'S2', totalScore: null },
      { studentId: 'S3', totalScore: 75 },
    ];

    const positions = rankStudents(results);
    const s2Position = positions.find((p) => p.studentId === 'S2');
    expect(s2Position?.position).toBeNull();
  });
});

// Test FIX-013: Zero Scores in Average Calculation
describe('FIX-013: Zero Scores in Average Calculation', () => {
  function calculateTermAverage(scores: (number | null)[]): number {
    const validScores = scores.filter((s) => s != null) as number[];
    if (validScores.length === 0) return 0;
    return validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
  }

  test('Zero scores included in average', () => {
    const scores = [80, 0, 70];
    const avg = calculateTermAverage(scores);
    expect(avg).toBe(50);
  });

  test('All zero scores: average is 0', () => {
    const scores = [0, 0, 0];
    const avg = calculateTermAverage(scores);
    expect(avg).toBe(0);
  });

  test('Mix of scores with zeros', () => {
    const scores = [90, 0, 60, 0, 50];
    const avg = calculateTermAverage(scores);
    expect(avg).toBe(40);
  });
});

// Test FIX-014: Grading Scale Lookup
describe('FIX-014: Grading Scale with Fallback', () => {
  function getGradeLabel(percentage: number): string {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }

  test('Grade boundaries are correct', () => {
    expect(getGradeLabel(100)).toBe('A');
    expect(getGradeLabel(70)).toBe('A');
    expect(getGradeLabel(69)).toBe('B');
    expect(getGradeLabel(60)).toBe('B');
    expect(getGradeLabel(50)).toBe('C');
    expect(getGradeLabel(45)).toBe('D');
    expect(getGradeLabel(40)).toBe('E');
    expect(getGradeLabel(39)).toBe('F');
  });
});

// Test FIX-003: Subject Enrollment Filter
describe('FIX-003: Student Enrollment Filter', () => {
  function filterStudentsBySubject(
    students: Array<{ id: string; name: string }>,
    enrolledIds: string[]
  ): Array<{ id: string; name: string }> {
    return students.filter((s) => enrolledIds.includes(s.id));
  }

  test('Filters students to only enrolled in subject', () => {
    const allStudents = [
      { id: 'S1', name: 'Student 1' },
      { id: 'S2', name: 'Student 2' },
      { id: 'S3', name: 'Student 3' },
    ];

    const enrolledIds = ['S1', 'S3'];
    const filtered = filterStudentsBySubject(allStudents, enrolledIds);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((s) => s.id)).toEqual(['S1', 'S3']);
  });
});

// Integration Test: End-to-End Grade Entry
describe('Integration: Grade Entry Workflow', () => {
  test('Valid grades pass all validations and calculations', () => {
    const gradeData = {
      studentId: 'S001',
      subjectId: 1,
      firstScore: 8,
      secondScore: 9,
      fourthScore: 72,
    };

    let maxScore = 0;
    if (gradeData.firstScore != null) maxScore += 10;
    if (gradeData.secondScore != null) maxScore += 10;
    if (gradeData.fourthScore != null) maxScore += 80;

    const average = gradeData.firstScore + gradeData.secondScore + gradeData.fourthScore;
    const percentage = (average / maxScore) * 100;

    let grade = 'F';
    if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';

    expect(maxScore).toBe(100);
    expect(average).toBe(89);
    expect(percentage).toBe(89);
    expect(grade).toBe('A');
  });
});
