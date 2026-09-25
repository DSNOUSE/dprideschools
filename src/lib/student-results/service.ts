import { prisma } from '@/lib/prisma';
import type { StudentHistoryResponse, SessionHistory, TermHistory, GradeDTO } from './types';
import { calculateGrade } from '@/lib/results/utils';

function toNumber(value: any): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export async function getStudentHistory(admissionNo: string): Promise<StudentHistoryResponse> {
  const student = await prisma.student.findFirst({
    where: { admissionNo: { equals: admissionNo, mode: 'insensitive' } },
    include: {
      enrollments: {
        include: {
          session: true,
          class: true,
        },
        orderBy: { enrolledAt: 'desc' },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  const sessions: SessionHistory[] = [];

  for (const enrollment of student.enrollments) {
    const terms = await prisma.term.findMany({
      where: { sessionId: enrollment.sessionId },
      orderBy: { order: 'asc' },
    });

    const termHistories: TermHistory[] = [];

    for (const term of terms) {
      const [subjectResults, termResult, report] = await Promise.all([
        prisma.subjectResult.findMany({
          where: {
            studentId: student.id,
            termId: term.id,
            sessionId: enrollment.sessionId,
            classId: enrollment.classId,
            status: { in: ['PUBLISHED', 'APPROVED'] },
          },
          include: {
            subject: { select: { name: true } },
            teacher: { include: { user: { select: { name: true } } } },
          },
        }),
        prisma.termResult.findUnique({
          where: {
            studentId_termId: {
              studentId: student.id,
              termId: term.id,
            },
          },
        }),
        prisma.report.findFirst({
          where: {
            studentId: student.id,
            termId: term.id,
          },
          include: {
            teacher: { include: { user: { select: { name: true } } } },
          },
        }),
      ]);

      if (subjectResults.length === 0 && !termResult) {
        continue;
      }

      const grades: GradeDTO[] = subjectResults.map((sr) => {
        const avg = toNumber(sr.totalScore ?? sr.percentage);
        return {
          subject: { name: sr.subject.name },
          firstScore: toNumber(sr.totalScore),
          secondScore: null,
          examScore: null,
          average: avg,
          grade: calculateGrade(avg),
        };
      });

      const resultSummary: TermHistory['result'] = termResult
        ? {
            average: toNumber(termResult.average),
            totalScore: toNumber(termResult.totalScore),
            maxScore: toNumber(termResult.maxScore),
            position: termResult.position ?? null,
            comment: termResult.classTeacherRemark ?? report?.teacherRemark ?? null,
            commentAuthor: report?.teacher
              ? {
                  name: report.teacher.fullName ?? report.teacher.user?.name ?? null,
                  teacherId: report.teacher.staffNumber ?? null,
                }
              : null,
            promotionStatus: termResult.promotionStatus ?? null,
          }
        : null;

      termHistories.push({
        term: { id: term.id, name: term.name },
        class: { name: enrollment.class.name },
        grades,
        result: resultSummary,
        reportStatus: report?.status ?? 'DRAFT',
      });
    }

    if (termHistories.length > 0) {
      sessions.push({
        session: { id: enrollment.session.id, name: enrollment.session.name },
        terms: termHistories,
      });
    }
  }

  return {
    student: {
      admissionNo: student.admissionNo,
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName,
      sex: student.sex ?? null,
    },
    sessions,
  };
}
