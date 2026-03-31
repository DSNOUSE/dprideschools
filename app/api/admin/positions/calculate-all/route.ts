import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface BatchPositionRequest {
  termId: number;
  sessionId: number;
  classIds?: number[]; // Optional: specific classes to process
}

interface ClassPositionResult {
  classId: number;
  className: string;
  departmentName: string;
  studentsProcessed: number;
  positionsUpdated: number;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Calculate positions for all classes (or specific classes) in a term/session
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
    const body: BatchPositionRequest = await request.json();
    const { termId, sessionId, classIds } = body;

    if (!termId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: termId, sessionId', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // ── Get Classes to Process ───────────────────────────────────
    let classes;
    if (classIds && classIds.length > 0) {
      // Process specific classes
      classes = await prisma.class.findMany({
        where: { id: { in: classIds } },
        include: { department: true },
      });
    } else {
      // Process all classes that have results for this term/session
      classes = await prisma.class.findMany({
        where: {
          results: {
            some: {
              termId,
              sessionId,
            }
          }
        },
        include: { department: true },
      });
    }

    if (classes.length === 0) {
      return NextResponse.json({
        message: 'No classes found with results for this term/session',
        termId,
        sessionId,
        results: [],
      });
    }

    // ── Process Each Class ───────────────────────────────────────
    const results: ClassPositionResult[] = [];

    for (const classItem of classes) {
      try {
        // Get all results for this class
        const classResults = await prisma.result.findMany({
          where: {
            classId: classItem.id,
            termId,
            sessionId,
          },
          orderBy: { totalScore: 'desc' },
        });

        if (classResults.length === 0) {
          results.push({
            classId: classItem.id,
            className: classItem.name,
            departmentName: classItem.department.name,
            studentsProcessed: 0,
            positionsUpdated: 0,
            status: 'success',
          });
          continue;
        }

        // Calculate positions with tie handling
        const positionUpdates: { studentId: string; position: number }[] = [];
        let currentPosition = 1;
        let previousScore = -1;
        let studentsAtCurrentPosition = 0;

        for (let i = 0; i < classResults.length; i++) {
          const result = classResults[i];
          
          if (result.totalScore === previousScore) {
            studentsAtCurrentPosition++;
          } else {
            if (i > 0) {
              currentPosition += studentsAtCurrentPosition;
            }
            studentsAtCurrentPosition = 1;
            previousScore = result.totalScore;
          }

          positionUpdates.push({
            studentId: result.studentId,
            position: currentPosition,
          });
        }

        // Update positions in database
        const updatePromises = positionUpdates.map(({ studentId, position }) =>
          prisma.result.updateMany({
            where: {
              studentId,
              classId: classItem.id,
              termId,
              sessionId,
            },
            data: { position },
          })
        );

        await prisma.$transaction(updatePromises);

        results.push({
          classId: classItem.id,
          className: classItem.name,
          departmentName: classItem.department.name,
          studentsProcessed: classResults.length,
          positionsUpdated: positionUpdates.length,
          status: 'success',
        });

      } catch (error) {
        logger.error(`Error processing class ${classItem.id}`, error);
        results.push({
          classId: classItem.id,
          className: classItem.name,
          departmentName: classItem.department.name,
          studentsProcessed: 0,
          positionsUpdated: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // ── Summary Statistics ───────────────────────────────────────
    const successfulClasses = results.filter(r => r.status === 'success');
    const totalStudentsProcessed = successfulClasses.reduce((sum, r) => sum + r.studentsProcessed, 0);
    const totalPositionsUpdated = successfulClasses.reduce((sum, r) => sum + r.positionsUpdated, 0);

    // ── Log Activity ───────────────────────────────────────────────
    logger.info('Batch position calculation completed', {
      termId,
      sessionId,
      totalClasses: classes.length,
      successfulClasses: successfulClasses.length,
      totalStudentsProcessed,
      totalPositionsUpdated,
      updatedBy: session.user.email,
    });

    // ── Return Response ─────────────────────────────────────────────
    return NextResponse.json({
      message: 'Batch position calculation completed',
      termId,
      sessionId,
      summary: {
        totalClasses: classes.length,
        successfulClasses: successfulClasses.length,
        failedClasses: results.length - successfulClasses.length,
        totalStudentsProcessed,
        totalPositionsUpdated,
      },
      results,
    });

  } catch (error) {
    logger.error('Error in batch position calculation', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Get summary of position calculation status for all classes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get('termId');
    const sessionId = searchParams.get('sessionId');

    if (!termId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: termId, sessionId', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Get classes with their position calculation status
    const classes = await prisma.class.findMany({
      where: {
        results: {
          some: {
            termId: parseInt(termId),
            sessionId: parseInt(sessionId),
          }
        }
      },
      include: {
        department: true,
        results: {
          where: {
            termId: parseInt(termId),
            sessionId: parseInt(sessionId),
          },
          select: {
            position: true,
            totalScore: true,
          }
        }
      },
    });

    const summary = classes.map(classItem => {
      const results = classItem.results;
      const studentsWithPositions = results.filter(r => r.position !== null).length;
      const studentsWithoutPositions = results.length - studentsWithPositions;
      
      return {
        classId: classItem.id,
        className: classItem.name,
        departmentName: classItem.department.name,
        totalStudents: results.length,
        studentsWithPositions,
        studentsWithoutPositions,
        positionCalculationComplete: studentsWithoutPositions === 0,
        highestScore: results.length > 0 ? Math.max(...results.map(r => r.totalScore)) : 0,
        lowestScore: results.length > 0 ? Math.min(...results.map(r => r.totalScore)) : 0,
      };
    });

    return NextResponse.json({
      termId: parseInt(termId),
      sessionId: parseInt(sessionId),
      totalClasses: classes.length,
      summary,
    });

  } catch (error) {
    logger.error('Error fetching position calculation summary', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
