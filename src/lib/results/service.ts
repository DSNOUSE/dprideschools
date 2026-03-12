/**
 * Service layer for the results check API.
 *
 * Encapsulates all data access + domain logic so the route handler
 * stays thin and the business rules are independently testable.
 */

import { prisma } from '@/lib/prisma';
import type { ResultData } from './types';
import type { CheckResultInput } from './schema';

interface ServiceInput {
  studentId: string;
  classId?: number;
  sessionId?: number;
  termId?: number;
}

/**
 * Core business logic: look up a student's results.
 *
 * Throws plain objects with `{ status, error, code }` that the route
 * handler can forward directly.
 */
export async function getStudentResult(input: ServiceInput): Promise<ResultData> {
  const admissionNo = (input.studentId ?? '').trim();

  // ── Student lookup ────────────────────────────────────────────
  const student = await prisma.student.findFirst({
    where: { admissionNo: { equals: admissionNo, mode: 'insensitive' } },
    include: { class: true, session: true },
  });

  if (!student) {
    throw { status: 404, error: 'Student not found or no results available for this term/session', code: 'STUDENT_NOT_FOUND' };
  }

  const resolvedClassId = input.classId ?? student.classId;
  const resolvedSessionId = input.sessionId ?? student.sessionId;

  if (input.classId && resolvedClassId !== student.classId) {
    throw { status: 400, error: 'Student is not in the selected class', code: 'CLASS_MISMATCH' };
  }
  if (input.sessionId && resolvedSessionId !== student.sessionId) {
    throw { status: 400, error: 'Student is not in the selected session', code: 'SESSION_MISMATCH' };
  }

  // ── Term resolution ───────────────────────────────────────────
  let resolvedTermId = input.termId ?? null;

  if (!resolvedTermId) {
    // Prefer the term from the active session; fall back to lowest id
    const activeSession = await prisma.session.findFirst({ where: { isActive: true } });
    const defaultTerm = await prisma.term.findFirst({
      orderBy: { id: 'asc' },
      ...(activeSession ? { where: { grades: { some: { sessionId: activeSession.id } } } } : {}),
    });
    if (!defaultTerm) {
      throw { status: 400, error: 'No academic terms are configured', code: 'NO_TERMS' };
    }
    resolvedTermId = defaultTerm.id;
  }

  const termInfo = await prisma.term.findUnique({ where: { id: resolvedTermId } });
  if (!termInfo) {
    throw { status: 400, error: 'Invalid term selected', code: 'INVALID_TERM' };
  }

  // ── Grades ────────────────────────────────────────────────────
  const grades = await prisma.grade.findMany({
    where: {
      studentId: student.id,
      classId: resolvedClassId,
      sessionId: resolvedSessionId,
      termId: resolvedTermId,
    },
    include: { subject: true, term: true },
    orderBy: { subject: { name: 'asc' } },
  });

  const studentPayload = {
    admissionNo: student.admissionNo,
    firstName: student.firstName,
    middleName: student.middleName || '',
    lastName: student.lastName,
    sex: student.sex || '',
    photo: null as string | null,
  };

  if (grades.length === 0) {
    return {
      hasResults: false,
      message: 'No results available for this term/session yet',
      student: studentPayload,
      class: { name: student.class.name },
      session: { name: student.session.name },
      term: { name: termInfo.name },
      grades: [],
      result: null,
    };
  }

  // ── Result row & computed stats ───────────────────────────────
  const result = await prisma.result.findUnique({
    where: {
      studentId_classId_termId_sessionId: {
        studentId: student.id,
        classId: resolvedClassId,
        termId: resolvedTermId,
        sessionId: resolvedSessionId,
      },
    },
  });

  const totalScore = grades.reduce((sum, g) => sum + g.average, 0);
  const average = grades.length > 0 ? totalScore / grades.length : 0;
  const maxScore = grades.length * 100;

  // ── Position fallback ─────────────────────────────────────────
  let position = result?.position ?? null;

  if (position === null) {
    const allResults = await prisma.result.findMany({
      where: {
        classId: resolvedClassId,
        termId: resolvedTermId,
        sessionId: resolvedSessionId,
      },
      orderBy: { average: 'desc' },
    });

    if (allResults.length > 0) {
      position = allResults.filter((r) => r.average > average).length + 1;
    }
  }

  return {
    student: studentPayload,
    class: { name: student.class.name },
    session: { name: student.session.name },
    term: { name: termInfo.name },
    grades: grades.map((g) => ({
      subject: { name: g.subject.name },
      firstScore: g.firstScore ?? undefined,
      secondScore: g.secondScore ?? undefined,
      examScore: g.fourthScore ?? undefined,            // DB column is `fourthScore`
      average: g.average,
    })),
    result: {
      position: position ?? undefined,
      average: result?.average ?? average,
      totalScore: result?.totalScore ?? totalScore,
      maxScore: result?.maxScore ?? maxScore,
    },
  };
}
