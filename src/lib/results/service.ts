/**
 * Service layer for the results check API.
 *
 * Encapsulates all data access + domain logic so the route handler
 * stays thin and the business rules are independently testable.
 */

import { prisma } from '@/lib/prisma';
import type { ResultData } from './types';

interface ServiceInput {
  studentId: string;
  classId?: number;
  sessionId?: number;
  termId?: number;
}

function toNumber(value: any): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

/**
 * Core business logic: look up a student's results.
 *
 * Throws plain objects with `{ status, error, code }` that the route
 * handler can forward directly.
 */
export async function getStudentResult(input: ServiceInput): Promise<ResultData> {
  const admissionNo = (input.studentId ?? '').trim();

  const student = await prisma.student.findFirst({
    where: { admissionNo: { equals: admissionNo, mode: 'insensitive' } },
  });

  if (!student) {
    throw { status: 404, error: 'Student not found or no results available for this term/session', code: 'STUDENT_NOT_FOUND' };
  }

  const activeSession = await prisma.session.findFirst({
    where: { isActive: true },
    orderBy: { id: 'desc' },
  });

  const resolvedSessionId = input.sessionId ?? activeSession?.id;
  if (!resolvedSessionId) {
    throw { status: 400, error: 'No academic sessions are configured', code: 'NO_SESSIONS' };
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      sessionId: resolvedSessionId,
      ...(input.classId ? { classId: input.classId } : {}),
    },
    include: {
      class: true,
      session: true,
    },
    orderBy: { enrolledAt: 'desc' },
  });

  if (!enrollment) {
    throw {
      status: input.classId || input.sessionId ? 400 : 404,
      error: input.classId
        ? 'Student is not in the selected class'
        : input.sessionId
          ? 'Student is not in the selected session'
          : 'Student enrollment not found',
      code: input.classId ? 'CLASS_MISMATCH' : input.sessionId ? 'SESSION_MISMATCH' : 'ENROLLMENT_NOT_FOUND',
    };
  }

  const resolvedClassId = enrollment.classId;

  let resolvedTermId = input.termId ?? null;
  if (!resolvedTermId) {
    const defaultTerm = await prisma.term.findFirst({
      where: {
        OR: [
          { sessionId: resolvedSessionId, isActive: true },
          { sessionId: resolvedSessionId },
          { subjectResults: { some: { sessionId: resolvedSessionId } } },
        ],
      },
      orderBy: [{ isActive: 'desc' }, { order: 'asc' }, { id: 'asc' }],
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

  const subjectResults = await prisma.subjectResult.findMany({
    where: {
      studentId: student.id,
      classId: resolvedClassId,
      sessionId: resolvedSessionId,
      termId: resolvedTermId,
    },
    include: {
      subject: true,
      term: true,
      teacher: {
        select: {
          fullName: true,
          staffNumber: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { subject: { name: 'asc' } },
  });

  // Prefer assessment breakdown when available
  const assessments = await prisma.assessment.findMany({
    where: {
      termId: resolvedTermId,
      offering: {
        classId: resolvedClassId,
        sessionId: resolvedSessionId,
      },
    },
    include: {
      scores: {
        where: { studentId: student.id },
      },
      offering: true,
    },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  const scoresBySubject = new Map<number, { ca1?: number; ca2?: number; exam?: number }>();
  for (const assessment of assessments) {
    const score = assessment.scores[0];
    if (!score || score.numericScore == null) continue;
    const subjectId = assessment.offering.subjectId;
    const bucket = scoresBySubject.get(subjectId) ?? {};
    const value = toNumber(score.numericScore);
    if (assessment.name === 'CA 1') bucket.ca1 = value;
    else if (assessment.name === 'CA 2') bucket.ca2 = value;
    else if (assessment.name === 'Exam') bucket.exam = value;
    scoresBySubject.set(subjectId, bucket);
  }

  const studentPayload = {
    admissionNo: student.admissionNo,
    firstName: student.firstName,
    middleName: student.middleName || '',
    lastName: student.lastName,
    sex: student.sex || '',
    photo: null as string | null,
  };

  if (subjectResults.length === 0) {
    return {
      hasResults: false,
      message: 'No results available for this term/session yet',
      student: studentPayload,
      class: { name: enrollment.class.name },
      session: { name: enrollment.session.name },
      term: { name: termInfo.name },
      grades: [],
      result: null,
    };
  }

  const termResult = await prisma.termResult.findUnique({
    where: {
      studentId_termId: {
        studentId: student.id,
        termId: resolvedTermId,
      },
    },
  });

  const totalScore = subjectResults.reduce((sum, g) => sum + toNumber(g.totalScore ?? g.percentage), 0);
  const average = subjectResults.length > 0 ? totalScore / subjectResults.length : 0;
  const maxScore = subjectResults.reduce((sum, g) => sum + toNumber(g.maxScore ?? 100), 0);

  let position = termResult?.position ?? null;
  if (position === null) {
    const allResults = await prisma.termResult.findMany({
      where: {
        classId: resolvedClassId,
        termId: resolvedTermId,
        sessionId: resolvedSessionId,
      },
      orderBy: { totalScore: 'desc' },
    });

    if (allResults.length > 0) {
      position = allResults.filter((r) => toNumber(r.totalScore) > totalScore).length + 1;
    }
  }

  const reports = await prisma.report.findMany({
    where: {
      studentId: student.id,
      termId: resolvedTermId,
      status: 'PUBLISHED',
    },
    include: {
      teacher: {
        select: {
          fullName: true,
          staffNumber: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const latestCommentReport = reports[0] ?? null;
  const generalComment =
    latestCommentReport?.teacherRemark ??
    termResult?.classTeacherRemark ??
    null;
  const commentAuthor =
    latestCommentReport?.teacher != null
      ? {
          name: latestCommentReport.teacher.fullName ?? latestCommentReport.teacher.user?.name ?? null,
          teacherId: latestCommentReport.teacher.staffNumber ?? null,
        }
      : { name: null, teacherId: null };

  return {
    student: studentPayload,
    class: { name: enrollment.class.name },
    session: { name: enrollment.session.name },
    term: { name: termInfo.name },
    grades: subjectResults.map((g) => {
      const breakdown = scoresBySubject.get(g.subjectId) ?? {};
      return {
        subject: { name: g.subject.name },
        firstScore: breakdown.ca1,
        secondScore: breakdown.ca2,
        examScore: breakdown.exam,
        average: toNumber(g.totalScore ?? g.percentage),
        teacher: g.teacher
          ? {
              name: g.teacher.fullName ?? g.teacher.user?.name ?? null,
              teacherId: g.teacher.staffNumber ?? null,
            }
          : null,
      };
    }),
    result: {
      position: position ?? undefined,
      average: toNumber(termResult?.average) || average,
      totalScore: toNumber(termResult?.totalScore) || totalScore,
      maxScore: toNumber(termResult?.maxScore) || maxScore,
      comment: generalComment || undefined,
      ...(generalComment ? { commentAuthor } : {}),
    },
  };
}


