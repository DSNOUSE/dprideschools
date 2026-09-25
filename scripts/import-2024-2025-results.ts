/**
 * scripts/import-2024-2025-results.ts
 *
 * Bulk-imports historical 2024/2025 results from a CSV, matched against
 * your actual schema.prisma field names.
 *
 * CSV TEMPLATE:
 *
 *   admissionNo,firstName,lastName,classId,termId,subjectId,ca1,ca2,exam,enrollmentStatus
 *   ADM/2021/001,Jane,Doe,11,5,3,8,9,65,PROMOTED
 *   ADM/2019/014,John,Smith,9,5,2,7,8,58,GRADUATED
 *
 * - classId: the student's HISTORICAL class for 2024/2025 (from your own
 *   records — for students who later left, don't try to derive this from
 *   the progression matrix; use whatever your old records actually show).
 * - termId: 5 = First Term, 6 = Second Term, 7 = Third Term (session 4).
 * - enrollmentStatus: PROMOTED / REPEATED / WITHDRAWN / TRANSFERRED / GRADUATED.
 *   Leave blank to default to PROMOTED for students who already exist in
 *   the system, or WITHDRAWN for students being created fresh by this import
 *   (i.e. they left before any session currently in your DB).
 *
 * Usage:
 *   npm install csv-parse   (if not already installed)
 *   npx tsx scripts/import-2024-2025-results.ts ./data/2024-2025-results.csv
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const SESSION_ID = 4; // 2024/2025

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Row = {
  admissionNo: string;
  firstName: string;
  lastName: string;
  classId: string;
  termId: string;
  subjectId: string;
  ca1: string;
  ca2: string;
  exam: string;
  enrollmentStatus?: string;
};

// Uses your actual GradingScale/GradeBand tables rather than hardcoded bands,
// so it stays correct if you ever change your grading system.
let cachedBands: { grade: string; minScore: number; maxScore: number; remark: string | null }[] | null = null;

async function getGrade(percentage: number): Promise<{ grade: string | null; remark: string | null }> {
  if (!cachedBands) {
    const scale = await prisma.gradingScale.findFirst({
      where: { isDefault: true },
      include: { bands: true },
    });
    if (!scale) {
      console.warn('No default GradingScale found — grade/remark will be left null.');
      cachedBands = [];
    } else {
      cachedBands = scale.bands.map((b) => ({
        grade: b.grade,
        minScore: Number(b.minScore),
        maxScore: Number(b.maxScore),
        remark: b.remark,
      }));
    }
  }
  const band = cachedBands.find((b) => percentage >= b.minScore && percentage <= b.maxScore);
  return { grade: band?.grade ?? null, remark: band?.remark ?? null };
}

async function ensureOffering(subjectId: number, classId: number, sessionId: number) {
  return prisma.subjectOffering.upsert({
    where: { subjectId_classId_sessionId: { subjectId, classId, sessionId } },
    update: { isActive: true },
    create: { subjectId, classId, sessionId, isCompulsory: true, isActive: true },
  });
}

async function ensureAssessment(offeringId: number, termId: number, name: 'CA 1' | 'CA 2' | 'Exam') {
  const maxScore = name === 'Exam' ? 80 : 10;
  const type = name === 'Exam' ? 'EXAM' : 'CA';
  return prisma.assessment.upsert({
    where: { offeringId_termId_name: { offeringId, termId, name } },
    update: {},
    create: { offeringId, termId, name, type, maxScore, weight: maxScore },
  });
}

async function recalculatePositions(classId: number, sessionId: number, termId: number) {
  const results = await prisma.termResult.findMany({
    where: { classId, sessionId, termId },
    orderBy: { totalScore: 'desc' },
  });

  let position = 0;
  let lastScore: string | null = null; // Decimal comes back as string-ish via toString comparisons
  let studentsAtRank = 0;

  for (const result of results) {
    const scoreKey = result.totalScore?.toString() ?? '';
    studentsAtRank++;
    if (scoreKey !== lastScore) {
      position += studentsAtRank;
      studentsAtRank = 0;
      lastScore = scoreKey;
    }
    await prisma.termResult.update({ where: { id: result.id }, data: { position } });
  }
}

function isValidEnrollmentStatus(value: string | undefined): value is EnrollmentStatus {
  return !!value && ['ACTIVE', 'PROMOTED', 'REPEATED', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED'].includes(value);
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-2024-2025-results.ts <path-to-csv>');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const rows: Row[] = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  console.log(`Loaded ${rows.length} rows from ${filePath}`);

  const touchedClassTermPairs = new Set<string>();
  let errors = 0;

  for (const row of rows) {
    try {
      const classId = parseInt(row.classId, 10);
      const termId = parseInt(row.termId, 10);
      const subjectId = parseInt(row.subjectId, 10);
      const ca1 = parseFloat(row.ca1);
      const ca2 = parseFloat(row.ca2);
      const exam = parseFloat(row.exam);
      const totalScore = ca1 + ca2 + exam;
      const maxScore = 100;
      const percentage = (totalScore / maxScore) * 100;
      const { grade, remark } = await getGrade(percentage);

      // 1. Find or create the student
      let student = await prisma.student.findUnique({ where: { admissionNo: row.admissionNo } });
      const studentIsNew = !student;

      if (!student) {
        student = await prisma.student.create({
          data: { admissionNo: row.admissionNo, firstName: row.firstName, lastName: row.lastName },
        });
        console.log(`  Created historical-only student: ${row.admissionNo}`);
      }

      // 2. Enrollment for this session — don't touch other sessions' enrollments
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { studentId_sessionId: { studentId: student.id, sessionId: SESSION_ID } },
      });

      const status: EnrollmentStatus = isValidEnrollmentStatus(row.enrollmentStatus)
        ? row.enrollmentStatus
        : studentIsNew
        ? 'WITHDRAWN'
        : 'PROMOTED';

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: { studentId: student.id, classId, sessionId: SESSION_ID, status },
        });
      }

      // 3. Offering + Assessments
      const offering = await ensureOffering(subjectId, classId, SESSION_ID);
      const assessments = {
        ca1: await ensureAssessment(offering.id, termId, 'CA 1'),
        ca2: await ensureAssessment(offering.id, termId, 'CA 2'),
        exam: await ensureAssessment(offering.id, termId, 'Exam'),
      };

      // 4. Scores
      for (const [assessmentId, numericScore] of [
        [assessments.ca1.id, ca1],
        [assessments.ca2.id, ca2],
        [assessments.exam.id, exam],
      ] as [string, number][]) {
        await prisma.assessmentScore.upsert({
          where: { assessmentId_studentId: { assessmentId, studentId: student.id } },
          update: { numericScore },
          create: { assessmentId, studentId: student.id, numericScore },
        });
      }

      // 5. SubjectResult — fields live directly on this model, not via offering
      await prisma.subjectResult.upsert({
        where: { studentId_subjectId_termId: { studentId: student.id, subjectId, termId } },
        update: { classId, sessionId: SESSION_ID, totalScore, maxScore, percentage, grade, remark, status: 'PUBLISHED' },
        create: {
          studentId: student.id,
          subjectId,
          classId,
          termId,
          sessionId: SESSION_ID,
          totalScore,
          maxScore,
          percentage,
          grade,
          remark,
          status: 'PUBLISHED',
        },
      });

      touchedClassTermPairs.add(`${classId}:${termId}`);
    } catch (err) {
      errors++;
      console.error(`  Row failed (admission ${row.admissionNo}, subject ${row.subjectId}):`, err);
    }
  }

  // 6. Recompute TermResult per student per class/term, then positions.
  // TermResult is keyed on (studentId, termId) only — termId already implies
  // the session, so no need to disambiguate further.
  console.log('Recomputing TermResults...');
  for (const pair of touchedClassTermPairs) {
    const [classIdStr, termIdStr] = pair.split(':');
    const classId = parseInt(classIdStr, 10);
    const termId = parseInt(termIdStr, 10);

    const enrollments = await prisma.enrollment.findMany({
      where: { classId, sessionId: SESSION_ID },
      select: { studentId: true },
    });

    for (const { studentId } of enrollments) {
      const subjectResults = await prisma.subjectResult.findMany({
        where: { studentId, termId, classId, sessionId: SESSION_ID },
      });
      if (subjectResults.length === 0) continue;

      const totalScore = subjectResults.reduce((sum, r) => sum + Number(r.totalScore ?? 0), 0);
      const maxScore = subjectResults.reduce((sum, r) => sum + Number(r.maxScore ?? 0), 0);
      const average = totalScore / subjectResults.length;

      await prisma.termResult.upsert({
        where: { studentId_termId: { studentId, termId } },
        update: { classId, sessionId: SESSION_ID, totalScore, maxScore, average, status: 'PUBLISHED' },
        create: {
          studentId,
          classId,
          termId,
          sessionId: SESSION_ID,
          totalScore,
          maxScore,
          average,
          status: 'PUBLISHED',
        },
      });
    }

    await recalculatePositions(classId, SESSION_ID, termId);
    console.log(`  Positions recalculated: class ${classId}, term ${termId}`);
  }

  console.log(`Done. ${rows.length - errors} rows succeeded, ${errors} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
