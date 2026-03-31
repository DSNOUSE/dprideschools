/**
 * Position calculation service for class rankings
 * 
 * This service handles:
 * - Calculating student positions based on total scores
 * - Handling ties (same score = same position)
 * - Batch position updates for classes
 * - Position recalculation triggers
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface PositionCalculationParams {
  classId: number;
  termId: number;
  sessionId: number;
}

export interface StudentPosition {
  studentId: string;
  position: number;
  totalScore: number;
  average: number;
}

export interface ClassPositionResult {
  classId: number;
  className: string;
  departmentName: string;
  positions: StudentPosition[];
  totalStudents: number;
  tiesHandled: number;
}

/**
 * Calculate positions for a single class based on total scores
 * Highest total score gets position 1
 * Ties are handled by giving same position to students with equal scores
 */
export async function calculateClassPositions(params: PositionCalculationParams): Promise<ClassPositionResult> {
  const { classId, termId, sessionId } = params;

  // Get class information
  const classInfo = await prisma.class.findUnique({
    where: { id: classId },
    include: { department: true },
  });

  if (!classInfo) {
    throw new Error(`Class with ID ${classId} not found`);
  }

  // Get all results for this class, ordered by total score (descending)
  const results = await prisma.result.findMany({
    where: {
      classId,
      termId,
      sessionId,
    },
    orderBy: { totalScore: 'desc' },
  });

  if (results.length === 0) {
    return {
      classId,
      className: classInfo.name,
      departmentName: classInfo.department.name,
      positions: [],
      totalStudents: 0,
      tiesHandled: 0,
    };
  }

  // Calculate positions with tie handling
  const positions: StudentPosition[] = [];
  let currentPosition = 1;
  let previousScore = -1;
  let studentsAtCurrentPosition = 0;
  let tiesHandled = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    
    // Check for tie with previous score
    if (result.totalScore === previousScore) {
      studentsAtCurrentPosition++;
      tiesHandled++;
    } else {
      // New score, update position (skip positions for ties)
      if (i > 0) {
        currentPosition += studentsAtCurrentPosition;
      }
      studentsAtCurrentPosition = 1;
      previousScore = result.totalScore;
    }

    positions.push({
      studentId: result.studentId,
      position: currentPosition,
      totalScore: result.totalScore,
      average: result.average,
    });
  }

  return {
    classId,
    className: classInfo.name,
    departmentName: classInfo.department.name,
    positions,
    totalStudents: results.length,
    tiesHandled,
  };
}

/**
 * Update positions in database for a class
 */
export async function updateClassPositions(params: PositionCalculationParams): Promise<ClassPositionResult> {
  const calculationResult = await calculateClassPositions(params);

  // Update positions in database using transaction
  const updatePromises = calculationResult.positions.map(({ studentId, position }) =>
    prisma.result.updateMany({
      where: {
        studentId,
        classId: params.classId,
        termId: params.termId,
        sessionId: params.sessionId,
      },
      data: { position },
    })
  );

  await prisma.$transaction(updatePromises);

  logger.info('Class positions updated', {
    classId: params.classId,
    className: calculationResult.className,
    termId: params.termId,
    sessionId: params.sessionId,
    totalStudents: calculationResult.totalStudents,
    tiesHandled: calculationResult.tiesHandled,
  });

  return calculationResult;
}

/**
 * Calculate positions for all classes in a term/session
 */
export async function calculateAllClassPositions(
  termId: number,
  sessionId: number,
  classIds?: number[]
): Promise<ClassPositionResult[]> {
  // Get classes to process
  let classes;
  if (classIds && classIds.length > 0) {
    classes = await prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { department: true },
    });
  } else {
    // Get all classes that have results for this term/session
    classes = await prisma.class.findMany({
      where: {
        results: {
          some: { termId, sessionId }
        }
      },
      include: { department: true },
    });
  }

  // Process each class
  const results: ClassPositionResult[] = [];
  for (const classItem of classes) {
    try {
      const result = await updateClassPositions({
        classId: classItem.id,
        termId,
        sessionId,
      });
      results.push(result);
    } catch (error) {
      logger.error(`Failed to calculate positions for class ${classItem.id}`, error);
      // Add failed result with error information
      results.push({
        classId: classItem.id,
        className: classItem.name,
        departmentName: classItem.department.name,
        positions: [],
        totalStudents: 0,
        tiesHandled: 0,
      });
    }
  }

  return results;
}

/**
 * Get current positions for a class with student details
 */
export async function getClassPositions(params: PositionCalculationParams) {
  const results = await prisma.result.findMany({
    where: {
      classId: params.classId,
      termId: params.termId,
      sessionId: params.sessionId,
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

  return {
    ...params,
    totalStudents: results.length,
    positions: results.map(result => ({
      position: result.position,
      totalScore: result.totalScore,
      average: result.average,
      student: result.student,
    })),
  };
}

/**
 * Recalculate positions for a specific student when their grades change
 */
export async function recalculateStudentPosition(
  studentId: string,
  classId: number,
  termId: number,
  sessionId: number
): Promise<void> {
  // First, recalculate all positions for the class to ensure consistency
  await updateClassPositions({
    classId,
    termId,
    sessionId,
  });

  logger.info('Student position recalculated', {
    studentId,
    classId,
    termId,
    sessionId,
  });
}

/**
 * Check if position calculation is needed for a class
 */
export async function isPositionCalculationNeeded(params: PositionCalculationParams): Promise<boolean> {
  const resultsWithoutPositions = await prisma.result.count({
    where: {
      classId: params.classId,
      termId: params.termId,
      sessionId: params.sessionId,
      position: null,
    },
  });

  return resultsWithoutPositions > 0;
}

/**
 * Get summary of position calculation status for all classes
 */
export async function getPositionCalculationSummary(termId: number, sessionId: number) {
  const classes = await prisma.class.findMany({
    where: {
      results: {
        some: { termId, sessionId }
      }
    },
    include: {
      department: true,
      results: {
        where: { termId, sessionId },
        select: {
          position: true,
          totalScore: true,
        }
      }
    },
  });

  return classes.map(classItem => {
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
      needsRecalculation: studentsWithoutPositions > 0,
    };
  });
}
