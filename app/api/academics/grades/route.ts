import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, logTeacherActivity, extractRequestInfo, extractTeacherInfo } from '@/lib/audit/service';
import { updateClassPositions } from '@/lib/results/positions';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// FIX-004: Validation schemas for grade entry
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

const batchGradesSchema = z.object({
  classId: z.number().int().positive('Class ID must be positive'),
  sessionId: z.number().int().positive('Session ID must be positive'),
  termId: z.number().int().positive('Term ID must be positive'),
  grades: z.array(gradeEntrySchema).min(1, 'At least one grade required'),
});

function toNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  return typeof value === 'number' ? value : Number(value);
}

// FIX-014: Get grade label from grading scale with fallback
async function getGradeLabel(percentage: number): Promise<string> {
  try {
    const scale = await prisma.gradingScale.findFirst({
      where: { isDefault: true },
      include: { bands: true },
    });

    if (scale && scale.bands.length > 0) {
      const band = scale.bands.find(
        (b) => percentage >= Number(b.minScore) && percentage <= Number(b.maxScore)
      );
      if (band?.grade) return band.grade;
    }
  } catch (error) {
    console.error('Error fetching grading scale:', error);
  }

  // Fallback hardcoded grading scale
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
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

// FIX-005: Transactional helper for offering operations
async function ensureOfferingTx(
  tx: any,
  subjectId: number,
  classId: number,
  sessionId: number
) {
  return tx.subjectOffering.upsert({
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

// FIX-005: Transactional helper for assessment operations
async function ensureAssessmentTx(
  tx: any,
  offeringId: number,
  termId: number,
  name: 'CA 1' | 'CA 2' | 'Exam',
  maxScore: number,
  order: number,
  teacherId?: string | null
) {
  const type = name === 'Exam' ? 'EXAM' : 'CA';

  return tx.assessment.upsert({
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

    const body = await request.json();

    // FIX-004: Validate input with Zod schemas
    let validatedData: z.infer<typeof batchGradesSchema>;
    try {
      validatedData = batchGradesSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.flatten() },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const { classId, sessionId, termId, grades } = validatedData;

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

    // FIX-005: Wrap entire batch in transaction for atomicity
    const results = await prisma.$transaction(
      async (tx) => {
        const batchResults: any[] = [];
        const auditPromises: Promise<any>[] = [];

        for (const gradeData of grades) {
          const { studentId, subjectId, firstScore, secondScore, fourthScore } = gradeData;
          const ca1 = firstScore == null ? null : toNumber(firstScore);
          const ca2 = secondScore == null ? null : toNumber(secondScore);
          const exam = fourthScore == null ? null : toNumber(fourthScore);
          const scores = [ca1, ca2, exam].filter((score): score is number => score != null);
          const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) : 0;

          const offering = await ensureOfferingTx(tx, subjectId, classId, sessionId);
          const [a1, a2, aExam] = await Promise.all([
            ensureAssessmentTx(tx, offering.id, termId, 'CA 1', 10, 1, teacherRecord?.id),
            ensureAssessmentTx(tx, offering.id, termId, 'CA 2', 10, 2, teacherRecord?.id),
            ensureAssessmentTx(tx, offering.id, termId, 'Exam', 80, 3, teacherRecord?.id),
          ]);

          const existing = await tx.subjectResult.findUnique({
            where: {
              studentId_subjectId_termId: { studentId, subjectId, termId },
            },
          });

          const upsertScore = async (assessmentId: string, value: number | null) => {
            if (value == null) {
              await tx.assessmentScore.deleteMany({ where: { assessmentId, studentId } });
              return;
            }
            await tx.assessmentScore.upsert({
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

          // FIX-009: Calculate actual maxScore based on which assessments were provided
          let maxScore = 0;
          if (ca1 != null) maxScore += 10;
          if (ca2 != null) maxScore += 10;
          if (exam != null) maxScore += 80;
          
          // If no assessments provided, default to full 100
          if (maxScore === 0) maxScore = 100;

          const percentage = maxScore > 0 ? (average / maxScore) * 100 : 0;

          // FIX-014: Query grading scale for grade label instead of hardcoded
          const gradeLabel = await getGradeLabel(percentage);

          const subjectResult = await tx.subjectResult.upsert({
            where: {
              studentId_subjectId_termId: { studentId, subjectId, termId },
            },
            update: {
              classId,
              sessionId,
              totalScore: average,
              maxScore,
              percentage: maxScore > 0 ? (average / maxScore) * 100 : 0,
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
              maxScore,
              percentage: maxScore > 0 ? (average / maxScore) * 100 : 0,
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
            maxScore,
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

          batchResults.push({
            id: subjectResult.id,
            ...newValues,
          });
        }

        await Promise.all(auditPromises);
        return batchResults;
      }
    );

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
    return NextResponse.json(
      { error: 'Failed to save grades', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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

      // FIX-013: Include zero scores in average calculation
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
