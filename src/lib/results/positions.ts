/**
 * Position calculation service for class rankings
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

function toNumber(value: any): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export async function calculateClassPositions(params: PositionCalculationParams): Promise<ClassPositionResult> {
  const { classId, termId, sessionId } = params;

  const classInfo = await prisma.class.findUnique({
    where: { id: classId },
    include: { level: true },
  });

  if (!classInfo) {
    throw new Error(`Class with ID ${classId} not found`);
  }

  const sectionLabel = classInfo.level.section.replaceAll('_', ' ');

  const results = await prisma.termResult.findMany({
    where: { classId, termId, sessionId },
    orderBy: { totalScore: 'desc' },
  });

  if (results.length === 0) {
    return {
      classId,
      className: classInfo.name,
      departmentName: sectionLabel,
      positions: [],
      totalStudents: 0,
      tiesHandled: 0,
    };
  }

  const positions: StudentPosition[] = [];
  let currentPosition = 1;
  let previousScore = Number.NaN;
  let studentsAtCurrentPosition = 0;
  let tiesHandled = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const score = toNumber(result.totalScore);

    if (score === previousScore) {
      studentsAtCurrentPosition++;
      tiesHandled++;
    } else {
      if (i > 0) currentPosition += studentsAtCurrentPosition;
      studentsAtCurrentPosition = 1;
      previousScore = score;
    }

    positions.push({
      studentId: result.studentId,
      position: currentPosition,
      totalScore: score,
      average: toNumber(result.average),
    });
  }

  return {
    classId,
    className: classInfo.name,
    departmentName: sectionLabel,
    positions,
    totalStudents: results.length,
    tiesHandled,
  };
}

export async function updateClassPositions(params: PositionCalculationParams): Promise<ClassPositionResult> {
  const calculationResult = await calculateClassPositions(params);

  const updatePromises = calculationResult.positions.map(({ studentId, position }) =>
    prisma.termResult.updateMany({
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

export async function calculateAllClassPositions(
  termId: number,
  sessionId: number,
  classIds?: number[]
): Promise<ClassPositionResult[]> {
  let classes;
  if (classIds && classIds.length > 0) {
    classes = await prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { level: true },
    });
  } else {
    classes = await prisma.class.findMany({
      where: {
        termResults: {
          some: { termId, sessionId },
        },
      },
      include: { level: true },
    });
  }

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
      results.push({
        classId: classItem.id,
        className: classItem.name,
        departmentName: classItem.level.section.replaceAll('_', ' '),
        positions: [],
        totalStudents: 0,
        tiesHandled: 0,
      });
    }
  }

  return results;
}

export async function getClassPositions(params: PositionCalculationParams) {
  const results = await prisma.termResult.findMany({
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
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  return {
    ...params,
    totalStudents: results.length,
    positions: results.map((result) => ({
      position: result.position,
      totalScore: toNumber(result.totalScore),
      average: toNumber(result.average),
      student: result.student,
    })),
  };
}

export async function recalculateStudentPosition(
  studentId: string,
  classId: number,
  termId: number,
  sessionId: number
): Promise<void> {
  await updateClassPositions({ classId, termId, sessionId });
  logger.info('Student position recalculated', { studentId, classId, termId, sessionId });
}

export async function isPositionCalculationNeeded(params: PositionCalculationParams): Promise<boolean> {
  const resultsWithoutPositions = await prisma.termResult.count({
    where: {
      classId: params.classId,
      termId: params.termId,
      sessionId: params.sessionId,
      position: null,
    },
  });
  return resultsWithoutPositions > 0;
}

export async function getPositionCalculationSummary(termId: number, sessionId: number) {
  const classes = await prisma.class.findMany({
    where: {
      termResults: {
        some: { termId, sessionId },
      },
    },
    include: {
      level: true,
      termResults: {
        where: { termId, sessionId },
        select: {
          position: true,
          totalScore: true,
        },
      },
    },
  });

  return classes.map((classItem) => {
    const results = classItem.termResults;
    const studentsWithPositions = results.filter((r) => r.position !== null).length;
    const studentsWithoutPositions = results.length - studentsWithPositions;

    return {
      classId: classItem.id,
      className: classItem.name,
      departmentName: classItem.level.section.replaceAll('_', ' '),
      totalStudents: results.length,
      studentsWithPositions,
      studentsWithoutPositions,
      positionCalculationComplete: studentsWithoutPositions === 0,
      needsRecalculation: studentsWithoutPositions > 0,
    };
  });
}

