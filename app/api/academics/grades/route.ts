import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, logTeacherActivity, extractRequestInfo, extractTeacherInfo } from '@/lib/audit/service';
import { updateClassPositions } from '@/lib/results/positions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  try {
    // Add authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add role-based access control
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');
    const termId = searchParams.get('termId');
    const subjectId = searchParams.get('subjectId');

    let whereClause: any = {};
    
    if (classId) whereClause.classId = parseInt(classId);
    if (sessionId) whereClause.sessionId = parseInt(sessionId);
    if (termId) whereClause.termId = parseInt(termId);
    if (subjectId) whereClause.subjectId = parseInt(subjectId);

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: true,
        subject: true,
        class: true,
        term: true,
        session: true
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } }
      ]
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  const startTime = Date.now();
  
  try {
    // Add authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add role-based access control
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { classId, sessionId, termId, grades } = await request.json();

    if (!classId || !sessionId || !termId || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid grades data' },
        { status: 400 }
      );
    }

    // Extract request information for audit logging
    const requestInfo = extractRequestInfo(request, session);
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user information safely
    const userId = (session.user as any)?.id || 'unknown';
    const userName = (session.user as any)?.name || 'Unknown';
    const userEmail = (session.user as any)?.email || 'unknown@example.com';
    
    // Extract teacher information
    const teacherInfo = extractTeacherInfo(session);

    const results: any[] = [];
    const auditPromises: Promise<any>[] = [];

    for (const gradeData of grades) {
      const { studentId, subjectId, firstScore, secondScore, fourthScore } = gradeData;

      // Calculate total (sum of component scores, each subject out of 100)
      const scores = [firstScore, secondScore, fourthScore].filter(score => score !== undefined);
      const average = scores.length > 0 ? scores.reduce((sum: any, score: any) => sum + score, 0) : 0;

      // Check if this is an update or create operation
      const existingGrade = await prisma.grade.findUnique({
        where: {
          studentId_subjectId_classId_termId_sessionId: {
            studentId,
            subjectId,
            classId,
            termId,
            sessionId
          }
        }
      });

      const newValues = {
        studentId,
        subjectId,
        classId,
        termId,
        sessionId,
        firstScore: firstScore || null,
        secondScore: secondScore || null,
        fourthScore: fourthScore || null,
        average
      };

      // Upsert grade
      const grade = await prisma.grade.upsert({
        where: {
          studentId_subjectId_classId_termId_sessionId: {
            studentId,
            subjectId,
            classId,
            termId,
            sessionId
          }
        },
        update: {
          firstScore: firstScore || null,
          secondScore: secondScore || null,
          fourthScore: fourthScore || null,
          average
        },
        create: newValues
      });

      // Create audit log entry
      const auditPromise = createAuditLog({
        entityType: 'Grade',
        entityId: grade.id,
        action: existingGrade ? 'UPDATE' : 'CREATE',
        oldValues: existingGrade ? {
          firstScore: existingGrade.firstScore,
          secondScore: existingGrade.secondScore,
          fourthScore: existingGrade.fourthScore,
          average: existingGrade.average
        } : undefined,
        newValues,
        userId,
        userName,
        userEmail,
        userRole: roles?.join(', ') || 'unknown',
        teacherId: teacherInfo.teacherId,
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
        notes: `Grade ${existingGrade ? 'updated' : 'created'} for student ${studentId}, subject ${subjectId}`
      });

      auditPromises.push(auditPromise);
      results.push(grade);
    }

    // Wait for all audit logs to be created
    await Promise.all(auditPromises);

    // Update result summaries and recalculate positions
    await updateResultSummaries(classId, sessionId, termId);
    
    // Recalculate class positions based on total scores
    try {
      await updateClassPositions({
        classId,
        sessionId,
        termId,
      });
    } catch (positionError) {
      console.error('Error recalculating class positions:', positionError);
      // Don't fail the grade update if position calculation fails
    }

    // Log teacher activity
    const duration = Date.now() - startTime;
    await logTeacherActivity({
      userId,
      action: 'GRADE_ENTRY',
      resourceType: 'GRADES',
      resourceId: batchId,
      details: {
        classId,
        sessionId,
        termId,
        gradesCount: grades.length,
        batchId
      },
      teacherId: teacherInfo.teacherId,
      teacherFullName: teacherInfo.teacherFullName,
      duration,
      recordsAffected: grades.length,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      sessionId: requestInfo.sessionId,
      classId,
      termId,
      sessionIdAcademic: sessionId
    });

    return NextResponse.json({ 
      message: 'Grades saved successfully',
      count: results.length,
      batchId
    });

  } catch (error) {
    console.error('Error saving grades:', error);
    return NextResponse.json(
      { error: 'Failed to save grades' },
      { status: 500 }
    );
  }
}

async function updateResultSummaries(classId: number, sessionId: number, termId: number) {
  try {
    // Get all students in this class/term/session
    const students = await prisma.student.findMany({
      where: {
        classId,
        sessionId
      },
      include: {
        grades: {
          where: {
            classId,
            termId,
            sessionId
          },
          include: {
            subject: true
          }
        }
      }
    });

    for (const student of students) {
      if (student.grades.length === 0) continue;

      // Calculate totals and averages
      const totalScore = student.grades.reduce((sum: any, grade: any) => sum + grade.average, 0);
      const average = totalScore / student.grades.length;
      const maxScore = student.grades.length * 100; // Assuming max 100 per subject

      // Upsert result (position will be calculated separately)
      await prisma.result.upsert({
        where: {
          studentId_classId_termId_sessionId: {
            studentId: student.id,
            classId,
            termId,
            sessionId
          }
        },
        update: {
          average,
          totalScore,
          maxScore,
          // Position will be updated by the position calculation service
        },
        create: {
          studentId: student.id,
          classId,
          termId,
          sessionId,
          average,
          totalScore,
          maxScore,
          // Position will be calculated separately
        }
      });
    }
  } catch (error) {
    console.error('Error updating result summaries:', error);
  }
}

