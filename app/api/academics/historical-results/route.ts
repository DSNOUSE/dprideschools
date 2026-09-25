import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole } from '@/lib/auth-utils';
import { z } from 'zod';
import { EnrollmentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const schema = z.object({
  admissionNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  classId: z.number().int(),
  sessionId: z.number().int(),
  termId: z.number().int(),
  subjectId: z.number().int(),
  ca1: z.number().min(0).max(10),
  ca2: z.number().min(0).max(10),
  exam: z.number().min(0).max(80),
  enrollmentStatus: z.nativeEnum(EnrollmentStatus).optional(),
});

async function getGrade(percentage: number) {
  const scale = await prisma.gradingScale.findFirst({ where: { isDefault: true }, include: { bands: true } });
  if (!scale || scale.bands.length === 0) return { grade: null, remark: null };
  const band = scale.bands.find((b) => percentage >= Number(b.minScore) && percentage <= Number(b.maxScore));
  return { grade: band?.grade ?? null, remark: band?.remark ?? null };
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isAuthorized =
      hasRole(session, 'Administrator', 'Teacher', 'Admin') ||
      userRole === 'Admin' ||
      userRole === 'Administrator' ||
      userRole === 'Teacher';

    if (!session || !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { admissionNo, firstName, lastName, classId, sessionId, termId, subjectId, ca1, ca2, exam, enrollmentStatus } =
      parsed.data;

    const totalScore = ca1 + ca2 + exam;
    const maxScore = 100;
    const percentage = (totalScore / maxScore) * 100;
    const { grade, remark } = await getGrade(percentage);

    const result = await prisma.$transaction(async (tx) => {
      let student = await tx.student.findUnique({ where: { admissionNo } });
      const studentIsNew = !student;
      if (!student) {
        student = await tx.student.create({ data: { admissionNo, firstName, lastName } });
      }

      const existingEnrollment = await tx.enrollment.findUnique({
        where: { studentId_sessionId: { studentId: student.id, sessionId } },
      });
      if (!existingEnrollment) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId,
            sessionId,
            status: enrollmentStatus ?? (studentIsNew ? 'WITHDRAWN' : 'PROMOTED'),
          },
        });
      }

      const offering = await tx.subjectOffering.upsert({
        where: { subjectId_classId_sessionId: { subjectId, classId, sessionId } },
        update: { isActive: true },
        create: { subjectId, classId, sessionId, isCompulsory: true, isActive: true },
      });

      const assessmentDefs: Array<['CA 1' | 'CA 2' | 'Exam', 'CA' | 'EXAM', number, number]> = [
        ['CA 1', 'CA', 10, ca1],
        ['CA 2', 'CA', 10, ca2],
        ['Exam', 'EXAM', 80, exam],
      ];

      for (const [name, type, max, numericScore] of assessmentDefs) {
        const assessment = await tx.assessment.upsert({
          where: { offeringId_termId_name: { offeringId: offering.id, termId, name } },
          update: {},
          create: { offeringId: offering.id, termId, name, type, maxScore: max, weight: max },
        });
        await tx.assessmentScore.upsert({
          where: { assessmentId_studentId: { assessmentId: assessment.id, studentId: student.id } },
          update: { numericScore },
          create: { assessmentId: assessment.id, studentId: student.id, numericScore },
        });
      }

      await tx.subjectResult.upsert({
        where: { studentId_subjectId_termId: { studentId: student.id, subjectId, termId } },
        update: { classId, sessionId, totalScore, maxScore, percentage, grade, remark, status: 'PUBLISHED' },
        create: {
          studentId: student.id,
          subjectId,
          classId,
          termId,
          sessionId,
          totalScore,
          maxScore,
          percentage,
          grade,
          remark,
          status: 'PUBLISHED',
        },
      });

      const subjectResults = await tx.subjectResult.findMany({
        where: { studentId: student.id, termId, classId, sessionId },
      });
      const termTotal = subjectResults.reduce((sum, r) => sum + Number(r.totalScore ?? 0), 0);
      const termMax = subjectResults.reduce((sum, r) => sum + Number(r.maxScore ?? 0), 0);
      const termAverage = termTotal / subjectResults.length;

      await tx.termResult.upsert({
        where: { studentId_termId: { studentId: student.id, termId } },
        update: { classId, sessionId, totalScore: termTotal, maxScore: termMax, average: termAverage, status: 'PUBLISHED' },
        create: {
          studentId: student.id,
          classId,
          termId,
          sessionId,
          totalScore: termTotal,
          maxScore: termMax,
          average: termAverage,
          status: 'PUBLISHED',
        },
      });

      return { studentId: student.id, offeringId: offering.id };
    });

    const classResults = await prisma.termResult.findMany({
      where: { classId, sessionId, termId },
      orderBy: { totalScore: 'desc' },
    });
    let position = 0;
    let lastScore: string | null = null;
    let atRank = 0;
    for (const r of classResults) {
      const key = r.totalScore?.toString() ?? '';
      atRank++;
      if (key !== lastScore) {
        position += atRank;
        atRank = 0;
        lastScore = key;
      }
      await prisma.termResult.update({ where: { id: r.id }, data: { position } });
    }

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error('Error saving historical result:', error);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
