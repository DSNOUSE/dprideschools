import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const results: any[] = [];

    for (const gradeData of grades) {
      const { studentId, subjectId, firstScore, secondScore, fourthScore } = gradeData;

      // Calculate total (sum of component scores, each subject out of 100)
      const scores = [firstScore, secondScore, fourthScore].filter(score => score !== undefined);
      const average = scores.length > 0 ? scores.reduce((sum: any, score: any) => sum + score, 0) : 0;

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
        create: {
          studentId,
          subjectId,
          classId,
          termId,
          sessionId,
          firstScore: firstScore || null,
          secondScore: secondScore || null,
          fourthScore: fourthScore || null,
          average
        }
      });

      results.push(grade);
    }

    // Update result summaries for affected students
    await updateResultSummaries(classId, sessionId, termId);

    return NextResponse.json({ 
      message: 'Grades saved successfully',
      count: results.length 
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

      // Calculate position
      const position = await calculateClassPosition(
        student.id,
        classId,
        termId,
        sessionId,
        average
      );

      // Upsert result
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
          position
        },
        create: {
          studentId: student.id,
          classId,
          termId,
          sessionId,
          average,
          totalScore,
          maxScore,
          position
        }
      });
    }
  } catch (error) {
    console.error('Error updating result summaries:', error);
  }
}

async function calculateClassPosition(
  studentId: string,
  classId: number,
  termId: number,
  sessionId: number,
  studentAverage: number
): Promise<number> {
  try {
    // Get all result summaries for this class/term/session
    const allResults = await prisma.result.findMany({
      where: {
        classId,
        termId,
        sessionId
      },
      orderBy: {
        average: 'desc'
      }
    });

    // Count how many students have higher averages
    const position = allResults.filter((result: any) => result.average > studentAverage).length + 1;
    
    return position;
  } catch (error) {
    console.error('Error calculating position:', error);
    return 1; // Default to position 1 if calculation fails
  }
}
