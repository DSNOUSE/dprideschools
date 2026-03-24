/**
 * Migration script: Recalculate all grade averages and result totals.
 *
 * The old code divided the sum of component scores by the number of
 * components, producing values well below 50 and grading everyone F.
 * The correct calculation is to SUM the component scores (each subject
 * is out of 100 total across firstScore + secondScore + examScore).
 *
 * This script:
 *  1. Recalculates every Grade.average = sum of non-null component scores.
 *  2. Recalculates every Result.totalScore, Result.average, and Result.maxScore.
 *
 * Usage:  node scripts/fix-grade-averages.js
 *         (Requires DATABASE_URL in .env)
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Step 1: Fix all Grade.average values ──────────────────────
  const grades = await prisma.grade.findMany();
  console.log(`Found ${grades.length} grade records to recalculate.\n`);

  let gradesUpdated = 0;

  for (const grade of grades) {
    const scores = [grade.firstScore, grade.secondScore, grade.fourthScore].filter(
      (s) => s !== null && s !== undefined
    );
    const correctAverage = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) : 0;

    if (grade.average !== correctAverage) {
      await prisma.grade.update({
        where: { id: grade.id },
        data: { average: correctAverage },
      });
      gradesUpdated++;
      console.log(
        `  Grade ${grade.id}: ${grade.average.toFixed(2)} → ${correctAverage.toFixed(2)}` +
        ` (scores: ${grade.firstScore ?? '-'}, ${grade.secondScore ?? '-'}, ${grade.fourthScore ?? '-'})`
      );
    }
  }

  console.log(`\n✅ Updated ${gradesUpdated} / ${grades.length} grade records.\n`);

  // ── Step 2: Recalculate all Result rows ───────────────────────
  const results = await prisma.result.findMany();
  console.log(`Found ${results.length} result records to recalculate.\n`);

  let resultsUpdated = 0;

  for (const result of results) {
    const studentGrades = await prisma.grade.findMany({
      where: {
        studentId: result.studentId,
        classId: result.classId,
        termId: result.termId,
        sessionId: result.sessionId,
      },
    });

    if (studentGrades.length === 0) continue;

    const totalScore = studentGrades.reduce((sum, g) => sum + g.average, 0);
    const average = totalScore / studentGrades.length;
    const maxScore = studentGrades.length * 100;

    if (
      result.totalScore !== totalScore ||
      result.average !== average ||
      result.maxScore !== maxScore
    ) {
      await prisma.result.update({
        where: { id: result.id },
        data: { totalScore, average, maxScore },
      });
      resultsUpdated++;
      console.log(
        `  Result ${result.id}: totalScore ${result.totalScore.toFixed(2)} → ${totalScore.toFixed(2)}` +
        `, average ${result.average.toFixed(2)} → ${average.toFixed(2)}`
      );
    }
  }

  console.log(`\n✅ Updated ${resultsUpdated} / ${results.length} result records.`);
  console.log('\nDone! All grades and results have been recalculated.');
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
