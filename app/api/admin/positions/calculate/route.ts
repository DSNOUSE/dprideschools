import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PositionCalculationRequest {
  classId: number;
  termId: number;
  sessionId: number;
}

interface PositionUpdate {
  studentId: string;
  position: number;
  totalScore: number;
}

/**
 * Calculate and update positions for all students in a class based on total scores
 * Highest total score gets position 1
 */
export async function POST(request: NextRequest) {
  try {
    // ── Authentication Check ─────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // ── Parse Request Body ───────────────────────────────────────
    const body: PositionCalculationRequest = await request.json();
    const { classId, termId, sessionId } = body;

    if (!classId || !termId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, termId, sessionId', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // ── Validate Class Exists ─────────────────────────────────────
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
      include: { department: true }
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
        { status: 404 }
      );
    }

    // ── Get All Results for Class/Term/Session ───────────────────────
    const results = await prisma.result.findMany({
      where: {
        classId,
        termId,
        sessionId,
      },
      include: {
        student: {
          select: {
            admissionNo: true,
            firstName: true,
            lastName: true,
            middleName: true,
          }
        }
      },
      orderBy: { totalScore: 'desc' }, // Highest total score first
    });

    if (results.length === 0) {
      return NextResponse.json({
        message: 'No results found for this class/term/session',
        class: classExists.name,
        department: classExists.department.name,
        termId,
        sessionId,
        positionsUpdated: 0,
      });
    }

    // ── Calculate Positions ───────────────────────────────────────
    const positionUpdates: PositionUpdate[] = [];
    let currentPosition = 1;
    let previousScore = -1;
    let studentsAtCurrentPosition = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // Handle ties: if same score as previous, same position
      if (result.totalScore === previousScore) {
        studentsAtCurrentPosition++;
      } else {
        // New score, update position
        if (i > 0) {
          currentPosition += studentsAtCurrentPosition;
        }
        studentsAtCurrentPosition = 1;
        previousScore = result.totalScore;
      }

      positionUpdates.push({
        studentId: result.studentId,
        position: currentPosition,
        totalScore: result.totalScore,
      });
    }

    // ── Update Positions in Database ─────────────────────────────────
    const updatePromises = positionUpdates.map(({ studentId, position }) =>
      prisma.result.updateMany({
        where: {
          studentId,
          classId,
          termId,
          sessionId,
        },
        data: { position },
      })
    );

    await prisma.$transaction(updatePromises);

    // ── Log Activity ───────────────────────────────────────────────
    logger.info('Class positions calculated', {
      classId,
      className: classExists.name,
      termId,
      sessionId,
      totalStudents: results.length,
      updatedBy: session.user.email,
    });

    // ── Return Response ─────────────────────────────────────────────
    return NextResponse.json({
      message: 'Positions calculated successfully',
      class: classExists.name,
      department: classExists.department.name,
      termId,
      sessionId,
      positionsUpdated: positionUpdates.length,
      positions: positionUpdates.map(update => ({
        studentId: update.studentId,
        position: update.position,
        totalScore: update.totalScore,
        student: results.find(r => r.studentId === update.studentId)?.student,
      })),
    });

  } catch (error) {
    logger.error('Error calculating class positions', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Get current positions for a class
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');
    const sessionId = searchParams.get('sessionId');

    if (!classId || !termId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: classId, termId, sessionId', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    const results = await prisma.result.findMany({
      where: {
        classId: parseInt(classId),
        termId: parseInt(termId),
        sessionId: parseInt(sessionId),
      },
      include: {
        student: {
          select: {
            admissionNo: true,
            firstName: true,
            lastName: true,
            middleName: true,
            sex: true,
          }
        }
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      classId: parseInt(classId),
      termId: parseInt(termId),
      sessionId: parseInt(sessionId),
      totalStudents: results.length,
      positions: results.map(result => ({
        position: result.position,
        totalScore: result.totalScore,
        average: result.average,
        student: result.student,
      })),
    });

  } catch (error) {
    logger.error('Error fetching class positions', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
