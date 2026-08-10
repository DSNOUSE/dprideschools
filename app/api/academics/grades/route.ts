import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, logTeacherActivity, extractRequestInfo, extractTeacherInfo } from '@/lib/audit/service';
import { updateClassPositions } from '@/lib/results/positions';

export const dynamic = 'force-dynamic';

function toNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  return typeof value === 'number' ? value : Number(value);
}

async function ensureTeacherRecord(userId: string, fallbackName?: string | null, staffNumber?: string | null) {
  const existing = await prisma.teacher.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.teacher.create({
    data: {
      userId,
      fullName: fallbackName || 'Teacher',
      staffNumber: staffNumber || null,
    },
  });
}

async function ensureOffering(subjectId: number, classId: number, sessionId: number) {
  return prisma.subjectOffering.upsert({
    where: {
      subjectId_classId_sessionId: { subjectId, classId, sessionId },
    },
    update: { isActive: true },
    create: {
      subjectId,
      classId,
      sessionId,
      isCompulsory: true,
      isActive: true,
    },
  });
}

async function ensureAssessment(
  offeringId: number,
  termId: number,
  name: 'CA 1' | 'CA 2' | 'Exam',
  teacherId?: string | null
) {
  const type = name === 'Exam' ? 'EXAM' : 'CA';
  const maxScore = name === 'Exam' ? 80 : 10;
  const order = name === 'CA 1' ? 1 : name === 'CA 2' ? 2 : 3;

  return prisma.assessment.upsert({
    where: {
      offeringId_termId_name: { offeringId, termId, name },
    },
    update: {
      teacherId: teacherId || undefined,
      type,
      valueType: 'NUMERIC',
      maxScore,
      weight: maxScore,
      order,
    },
    create: {
      offeringId,
      termId,
      teacherId: teacherId || null,
      name,
      type,
      valueType: 'NUMERIC',
      maxScore,
      weight: maxScore,
      order,
    },
  });
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');
    const termId = searchParams.get('termId');
    const subjectId = searchParams.get('subjectId');

    const whereClause: any = {};
    if (classId) whereClause.classId = parseInt(classId);
    if (sessionId) whereClause.sessionId = parseInt(sessionId);
    if (termId) whereClause.termId = parseInt(termId);
    if (subjectId) whereClause.subjectId = parseInt(subjectId);

    const subjectResults = await prisma.subjectResult.findMany({
      where: whereClause,
      include: {
        student: true,
        subject: true,
        class: true,
        term: true,
        session: true,
        teacher: true,
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
      ],
    });

    // Shape response like legacy Grade rows for existing UI compatibility
    const grades = await Promise.all(
      subjectResults.map(async (sr) => {
        const assessments = await prisma.assessment.findMany({
          where: {
            termId: sr.termId,
            offering: {
              subjectId: sr.subjectId,
              classId: sr.classId,
              sessionId: sr.sessionId,
            },
          },
          include: {
            scores: { where: { studentId: sr.studentId } },
          },
        });

        const byName = Object.fromEntries(
          assessments.map((a) => [a.name, a.scores[0]?.numericScore != null ? Number(a.scores[0].numericScore) : null])
        );

        return {
          id: sr.id,
          studentId: sr.studentId,
          subjectId: sr.subjectId,
          classId: sr.classId,
          termId: sr.termId,
          sessionId: sr.sessionId,
          firstScore: byName['CA 1'] ?? null,
          secondScore: byName['CA 2'] ?? null,
          fourthScore: byName['Exam'] ?? null,
          average: sr.totalScore != null ? Number(sr.totalScore) : Number(sr.percentage ?? 0),
          teacherId: sr.teacher?.userId ?? null,
          student: sr.student,
          subject: sr.subject,
          class: sr.class,
          term: sr.term,
          session: sr.session,
        };
      })
    );

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { classId, sessionId, termId, grades } = await request.json();
    if (!classId || !sessionId || !termId || !grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: 'Missing required fields or invalid grades data' }, { status: 400 });
    }

    const requestInfo = extractRequestInfo(request, session);
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = (session.user as any)?.id || 'unknown';
    const userName = (session.user as any)?.name || 'Unknown';
    const userEmail = (session.user as any)?.email || 'unknown@example.com';
    const teacherInfo = extractTeacherInfo(session);

    let teacherRecord = null as Awaited<ReturnType<typeof ensureTeacherRecord>> | null;
    if (userId !== 'unknown') {
      teacherRecord = await ensureTeacherRecord(userId, userName, teacherInfo.teacherId);
    }

    const results: any[] = [];
    const auditPromises: Promise<any>[] = [];

    for (const gradeData of grades) {
      const { studentId, subjectId, firstScore, secondScore, fourthScore } = gradeData;
      const ca1 = firstScore == null || firstScore === '' ? null : toNumber(firstScore);
      const ca2 = secondScore == null || secondScore === '' ? null : toNumber(secondScore);
      const exam = fourthScore == null || fourthScore === '' ? null : toNumber(fourthScore);
      const scores = [ca1, ca2, exam].filter((score): score is number => score != null);
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) : 0;

      const offering = await ensureOffering(subjectId, classId, sessionId);
      const [a1, a2, aExam] = await Promise.all([
        ensureAssessment(offering.id, termId, 'CA 1', teacherRecord?.id),
        ensureAssessment(offering.id, termId, 'CA 2', teacherRecord?.id),
        ensureAssessment(offering.id, termId, 'Exam', teacherRecord?.id),
      ]);

      const existing = await prisma.subjectResult.findUnique({
        where: {
          studentId_subjectId_termId: { studentId, subjectId, termId },
        },
      });

      const upsertScore = async (assessmentId: string, value: number | null) => {
        if (value == null) {
          await prisma.assessmentScore.deleteMany({ where: { assessmentId, studentId } });
          return;
        }
        await prisma.assessmentScore.upsert({
          where: { assessmentId_studentId: { assessmentId, studentId } },
          update: { numericScore: value },
          create: { assessmentId, studentId, numericScore: value },
        });
      };

      await Promise.all([
        upsertScore(a1.id, ca1),
        upsertScore(a2.id, ca2),
        upsertScore(aExam.id, exam),
      ]);

      const gradeLabel =
        average >= 70 ? 'A' :
        average >= 60 ? 'B' :
        average >= 50 ? 'C' :
        average >= 45 ? 'D' :
        average >= 40 ? 'E' : 'F';

      const subjectResult = await prisma.subjectResult.upsert({
        where: {
          studentId_subjectId_termId: { studentId, subjectId, termId },
        },
        update: {
          classId,
          sessionId,
          totalScore: average,
          maxScore: 100,
          percentage: average,
          grade: gradeLabel,
          status: 'DRAFT',
          teacherId: teacherRecord?.id ?? undefined,
        },
        create: {
          studentId,
          subjectId,
          classId,
          termId,
          sessionId,
          totalScore: average,
          maxScore: 100,
          percentage: average,
          grade: gradeLabel,
          status: 'DRAFT',
          teacherId: teacherRecord?.id ?? null,
        },
      });

      const newValues = {
        studentId,
        subjectId,
        classId,
        termId,
        sessionId,
        firstScore: ca1,
        secondScore: ca2,
        fourthScore: exam,
        average,
      };

      auditPromises.push(
        createAuditLog({
          entityType: 'SUBJECT_RESULT',
          entityId: subjectResult.id,
          action: existing ? 'UPDATE' : 'CREATE',
          oldValues: existing
            ? {
                totalScore: existing.totalScore,
                percentage: existing.percentage,
                grade: existing.grade,
              }
            : undefined,
          newValues,
          userId,
          userName,
          userEmail,
          userRole: roles?.join(', ') || 'unknown',
          teacherId: teacherRecord?.id,
          teacherFullName: teacherInfo.teacherFullName,
          sessionId: requestInfo.sessionId,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          classId,
          studentId,
          subjectId,
          termId,
          sessionIdAcademic: sessionId,
          source: 'WEB',
          batchId,
          notes: `Grade ${existing ? 'updated' : 'created'} for student ${studentId}, subject ${subjectId}`,
        })
      );

      results.push({
        id: subjectResult.id,
        ...newValues,
      });
    }

    await Promise.all(auditPromises);
    await updateResultSummaries(classId, sessionId, termId);

    try {
      await updateClassPositions({ classId, sessionId, termId });
    } catch (positionError) {
      console.error('Error recalculating class positions:', positionError);
    }

    const duration = Date.now() - startTime;
    await logTeacherActivity({
      userId,
      action: 'GRADE_ENTRY',
      resourceType: 'GRADES',
      resourceId: batchId,
      details: { classId, sessionId, termId, gradesCount: grades.length, batchId },
      teacherId: teacherRecord?.id,
      teacherFullName: teacherInfo.teacherFullName,
      duration,
      recordsAffected: grades.length,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      sessionId: requestInfo.sessionId,
      classId,
      termId,
      sessionIdAcademic: sessionId,
    });

    return NextResponse.json({
      message: 'Grades saved successfully',
      count: results.length,
      batchId,
    });
  } catch (error) {
    console.error('Error saving grades:', error);
    return NextResponse.json({ error: 'Failed to save grades' }, { status: 500 });
  }
}

async function updateResultSummaries(classId: number, sessionId: number, termId: number) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId, sessionId, status: 'ACTIVE' },
      select: { studentId: true },
    });

    for (const { studentId } of enrollments) {
      const subjectResults = await prisma.subjectResult.findMany({
        where: { studentId, classId, termId, sessionId },
      });
      if (subjectResults.length === 0) continue;

      const totalScore = subjectResults.reduce((sum, row) => sum + Number(row.totalScore ?? row.percentage ?? 0), 0);
      const average = totalScore / subjectResults.length;
      const maxScore = subjectResults.length * 100;

      await prisma.termResult.upsert({
        where: {
          studentId_termId: { studentId, termId },
        },
        update: {
          classId,
          sessionId,
          average,
          totalScore,
          maxScore,
          status: 'DRAFT',
        },
        create: {
          studentId,
          classId,
          termId,
          sessionId,
          average,
          totalScore,
          maxScore,
          status: 'DRAFT',
        },
      });
    }
  } catch (error) {
    console.error('Error updating result summaries:', error);
  }
}
