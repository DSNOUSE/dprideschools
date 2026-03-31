import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────
// Mock Prisma before importing anything that touches it.
// vi.hoisted ensures the factory runs before the hoisted vi.mock.
// ──────────────────────────────────────────────────────────────
const mockPrisma = vi.hoisted(() => ({
  student: { findFirst: vi.fn() },
  term: { findFirst: vi.fn(), findUnique: vi.fn() },
  session: { findFirst: vi.fn() },
  grade: { findMany: vi.fn() },
  result: { findUnique: vi.fn(), findMany: vi.fn() },
  report: { findMany: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

import { getStudentResult } from '@/lib/results/service';
import { checkResultSchema } from '@/lib/results/schema';
import { rateLimiter } from '@/lib/results/rate-limiter';
import {
  calculateGrade,
  getGradeColor,
  formatStudentName,
  formatCommentAttribution,
} from '@/lib/results/utils';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function fakeStudent(overrides = {}) {
  return {
    id: 'stu-1',
    admissionNo: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'A',
    sex: 'M',
    classId: 1,
    sessionId: 1,
    class: { name: 'JSS 1' },
    session: { name: '2025/2026' },
    ...overrides,
  };
}

function fakeGrade(subjectName: string, avg: number) {
  return {
    id: 'g-' + subjectName,
    firstScore: avg - 5,
    secondScore: avg,
    fourthScore: avg + 5,
    average: avg,
    subject: { name: subjectName },
    term: { name: 'First Term' },
  };
}

// ──────────────────────────────────────────────────────────────
// 1. Schema validation tests
// ──────────────────────────────────────────────────────────────
describe('checkResultSchema', () => {
  it('accepts valid input with all fields', () => {
    const res = checkResultSchema.safeParse({
      studentId: 'STU001',
      classId: '1',
      sessionId: '2',
      termId: '3',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.classId).toBe(1);
      expect(res.data.sessionId).toBe(2);
      expect(res.data.termId).toBe(3);
    }
  });

  it('accepts valid input with only studentId', () => {
    const res = checkResultSchema.safeParse({ studentId: 'STU001' });
    expect(res.success).toBe(true);
  });

  it('rejects missing studentId', () => {
    const res = checkResultSchema.safeParse({});
    expect(res.success).toBe(false);
  });

  it('rejects empty studentId', () => {
    const res = checkResultSchema.safeParse({ studentId: '' });
    expect(res.success).toBe(false);
  });

  it('rejects non-numeric classId', () => {
    const res = checkResultSchema.safeParse({ studentId: 'STU001', classId: 'abc' });
    expect(res.success).toBe(false);
  });

  it('rejects negative classId', () => {
    const res = checkResultSchema.safeParse({ studentId: 'STU001', classId: '-1' });
    expect(res.success).toBe(false);
  });

  it('transforms numeric strings to numbers', () => {
    const res = checkResultSchema.safeParse({
      studentId: 'STU001',
      classId: '10',
      sessionId: 20,
      termId: '30',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.classId).toBe(10);
      expect(res.data.sessionId).toBe(20);
      expect(res.data.termId).toBe(30);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// 2. Rate limiter tests
// ──────────────────────────────────────────────────────────────
describe('rateLimiter', () => {
  beforeEach(() => rateLimiter.reset());

  it('allows requests under the limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.check('192.168.1.1')).toBe(true);
    }
  });

  it('blocks the 11th request from the same key', () => {
    for (let i = 0; i < 10; i++) rateLimiter.check('10.0.0.1');
    expect(rateLimiter.check('10.0.0.1')).toBe(false);
  });

  it('tracks different keys independently', () => {
    for (let i = 0; i < 10; i++) rateLimiter.check('ip-a');
    expect(rateLimiter.check('ip-a')).toBe(false);
    expect(rateLimiter.check('ip-b')).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// 3. Utility function tests
// ──────────────────────────────────────────────────────────────
describe('results utils', () => {
  describe('calculateGrade', () => {
    it.each([
      [95, 'A'],
      [80, 'A'],
      [79, 'B'],
      [70, 'B'],
      [60, 'C'],
      [50, 'D'],
      [49, 'F'],
      [0, 'F'],
    ])('score %d → grade %s', (score, expected) => {
      expect(calculateGrade(score)).toBe(expected);
    });
  });

  describe('getGradeColor', () => {
    it('returns green for A', () => expect(getGradeColor('A')).toContain('green'));
    it('returns blue for B', () => expect(getGradeColor('B')).toContain('blue'));
    it('returns red for F', () => expect(getGradeColor('F')).toContain('red'));
  });

  describe('formatStudentName', () => {
    it('joins all parts', () => expect(formatStudentName('John', 'A', 'Doe')).toBe('John A Doe'));
    it('skips null middle name', () => expect(formatStudentName('John', null, 'Doe')).toBe('John Doe'));
    it('skips empty strings', () => expect(formatStudentName('John', '', 'Doe')).toBe('John Doe'));
  });
});

// ──────────────────────────────────────────────────────────────
// 4. Service layer tests
// ──────────────────────────────────────────────────────────────
describe('getStudentResult', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 404 when student not found', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(null);

    await expect(getStudentResult({ studentId: 'NOPE' })).rejects.toMatchObject({
      status: 404,
      code: 'STUDENT_NOT_FOUND',
    });
  });

  it('throws 400 on class mismatch', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(fakeStudent({ classId: 2 }));

    await expect(
      getStudentResult({ studentId: 'STU001', classId: 1 }),
    ).rejects.toMatchObject({ status: 400, code: 'CLASS_MISMATCH' });
  });

  it('throws 400 on session mismatch', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(fakeStudent({ sessionId: 3 }));

    await expect(
      getStudentResult({ studentId: 'STU001', sessionId: 1 }),
    ).rejects.toMatchObject({ status: 400, code: 'SESSION_MISMATCH' });
  });

  it('throws 400 when no terms configured', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(fakeStudent());
    mockPrisma.session.findFirst.mockResolvedValue(null);
    mockPrisma.term.findFirst.mockResolvedValue(null);

    await expect(getStudentResult({ studentId: 'STU001' })).rejects.toMatchObject({
      status: 400,
      code: 'NO_TERMS',
    });
  });

  it('returns hasResults: false when no grades exist', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(fakeStudent());
    mockPrisma.session.findFirst.mockResolvedValue(null);
    mockPrisma.term.findFirst.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.term.findUnique.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.grade.findMany.mockResolvedValue([]);

    const result = await getStudentResult({ studentId: 'STU001' });
    expect(result.hasResults).toBe(false);
    expect(result.grades).toEqual([]);
    expect(result.result).toBeNull();
  });

  it('returns full result with grades', async () => {
    const student = fakeStudent();
    mockPrisma.student.findFirst.mockResolvedValue(student);
    mockPrisma.term.findUnique.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.grade.findMany.mockResolvedValue([
      fakeGrade('Mathematics', 80),
      fakeGrade('English', 70),
    ]);
    mockPrisma.result.findUnique.mockResolvedValue({
      position: 3,
      average: 75,
      totalScore: 150,
      maxScore: 200,
    });
    mockPrisma.report.findMany.mockResolvedValue([]);

    const result = await getStudentResult({
      studentId: 'STU001',
      classId: 1,
      sessionId: 1,
      termId: 1,
    });

    expect(result.student.admissionNo).toBe('STU001');
    expect(result.grades).toHaveLength(2);
    expect(result.grades[0].subject.name).toBe('Mathematics');
    // fourthScore mapped to examScore
    expect(result.grades[0].examScore).toBe(85);
    expect(result.result?.position).toBe(3);
  });

  it('computes fallback position when result.position is null', async () => {
    const student = fakeStudent();
    mockPrisma.student.findFirst.mockResolvedValue(student);
    mockPrisma.term.findUnique.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.grade.findMany.mockResolvedValue([fakeGrade('Maths', 60)]);
    mockPrisma.result.findUnique.mockResolvedValue(null);
    mockPrisma.result.findMany.mockResolvedValue([
      { average: 90 },
      { average: 80 },
      { average: 50 },
    ]);
    mockPrisma.report.findMany.mockResolvedValue([]);

    const result = await getStudentResult({
      studentId: 'STU001',
      classId: 1,
      sessionId: 1,
      termId: 1,
    });

    // avg = 60 → 2 students above (90, 80) → position 3
    expect(result.result?.position).toBe(3);
  });

  it('throws 400 for invalid term id', async () => {
    mockPrisma.student.findFirst.mockResolvedValue(fakeStudent());
    mockPrisma.term.findUnique.mockResolvedValue(null);

    await expect(
      getStudentResult({ studentId: 'STU001', classId: 1, sessionId: 1, termId: 999 }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TERM' });
  });

  it('includes commentAuthor when a published general report exists', async () => {
    const student = fakeStudent();
    mockPrisma.student.findFirst.mockResolvedValue(student);
    mockPrisma.term.findUnique.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.grade.findMany.mockResolvedValue([fakeGrade('Maths', 70)]);
    mockPrisma.result.findUnique.mockResolvedValue({ position: 1, average: 70, totalScore: 70, maxScore: 100 });
    mockPrisma.report.findMany.mockResolvedValue([
      {
        comment: 'Excellent term.',
        teacher: { name: 'Dr. Ada Okafor', teacherId: 'TCH-1001' },
      },
    ]);

    const result = await getStudentResult({
      studentId: 'STU001',
      classId: 1,
      sessionId: 1,
      termId: 1,
    });

    expect(result.result?.comment).toBe('Excellent term.');
    expect(result.result?.commentAuthor).toEqual({
      name: 'Dr. Ada Okafor',
      teacherId: 'TCH-1001',
    });
  });

  it('includes fallback commentAuthor when a published general report has no teacher row', async () => {
    const student = fakeStudent();
    mockPrisma.student.findFirst.mockResolvedValue(student);
    mockPrisma.term.findUnique.mockResolvedValue({ id: 1, name: 'First Term' });
    mockPrisma.grade.findMany.mockResolvedValue([fakeGrade('Maths', 70)]);
    mockPrisma.result.findUnique.mockResolvedValue({ position: 1, average: 70, totalScore: 70, maxScore: 100 });
    mockPrisma.report.findMany.mockResolvedValue([
      {
        comment: 'Legacy comment.',
        teacher: null,
      },
    ]);

    const result = await getStudentResult({
      studentId: 'STU001',
      classId: 1,
      sessionId: 1,
      termId: 1,
    });

    expect(result.result?.comment).toBe('Legacy comment.');
    expect(result.result?.commentAuthor).toEqual({ name: null, teacherId: null });
  });
});

describe('formatCommentAttribution', () => {
  it('prefers full name', () => {
    expect(
      formatCommentAttribution({ name: 'Jane Smith', teacherId: 'T-1' }),
    ).toBe('Jane Smith');
  });

  it('falls back to staff id when name empty', () => {
    expect(formatCommentAttribution({ name: null, teacherId: 'EMP-9' })).toBe('Staff ID: EMP-9');
  });

  it('falls back to generic label when both missing', () => {
    expect(formatCommentAttribution({ name: null, teacherId: null })).toBe('Teacher');
  });
});
