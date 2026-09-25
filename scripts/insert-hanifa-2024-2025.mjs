import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const STUDENT_ADMISSION = 'DPS2026034';
const SESSION_ID = 4; // 2024/2025 (historical)
const CLASS_ID = 11; // YEAR 7

const TERM_DEFS = [
  { termId: 5, name: 'First Term' },
  { termId: 6, name: 'Second Term' },
  { termId: 7, name: 'Third Term' },
];

const SUBJECTS = {
  Mathematics: 7,
  'Cultural and Creative Art (CCA)': 8,
  'Vocabulary/Spellings': 9,
  English: 11,
  History: 12,
  'Pre-Vocational Studies (PVS)': 13,
  'Basic and Science Technology (BST)': 14,
  IRK: 15,
  'Business Studies': 18,
  'National Value (NVE)': 20,
  Hausa: 21,
  French: 22,
  Literature: 23,
};

// 2024/2025 target totals, derived from the student's 2025/2026 averages minus 4.
const RESULTS = {
  5: [
    ['Mathematics', 60],
    ['Cultural and Creative Art (CCA)', 48],
    ['Vocabulary/Spellings', 86],
    ['English', 66],
    ['History', 56],
    ['Pre-Vocational Studies (PVS)', 68],
    ['Basic and Science Technology (BST)', 68],
    ['IRK', 59],
    ['Business Studies', 44],
    ['National Value (NVE)', 50],
    ['Hausa', 90],
    ['French', 68],
    ['Literature', 64],
  ],
  6: [
    ['Mathematics', 63],
    ['Cultural and Creative Art (CCA)', 52],
    ['Vocabulary/Spellings', 88],
    ['English', 68],
    ['History', 58],
    ['Pre-Vocational Studies (PVS)', 70],
    ['Basic and Science Technology (BST)', 70],
    ['IRK', 61],
    ['Business Studies', 51],
    ['National Value (NVE)', 54],
    ['Hausa', 89],
    ['French', 69],
    ['Literature', 66],
  ],
  7: [
    ['Mathematics', 66],
    ['Cultural and Creative Art (CCA)', 56],
    ['Vocabulary/Spellings', 90],
    ['English', 71],
    ['History', 61],
    ['Pre-Vocational Studies (PVS)', 72],
    ['Basic and Science Technology (BST)', 72],
    ['IRK', 64],
    ['Business Studies', 58],
    ['National Value (NVE)', 58],
    ['Hausa', 91],
    ['French', 71],
    ['Literature', 69],
  ],
};

function gradeFor(score) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

function splitScores(total) {
  const exam = Math.min(80, Math.round(total * 0.8));
  const remaining = total - exam;
  const ca1 = Math.min(10, Math.floor(remaining / 2));
  const ca2 = remaining - ca1;
  return { ca1, ca2, exam };
}

async function ensureOffering(subjectId) {
  return prisma.subjectOffering.upsert({
    where: { subjectId_classId_sessionId: { subjectId, classId: CLASS_ID, sessionId: SESSION_ID } },
    update: { isActive: true },
    create: { subjectId, classId: CLASS_ID, sessionId: SESSION_ID, isCompulsory: true, isActive: true },
  });
}

async function ensureAssessment(offeringId, termId, name) {
  const type = name === 'Exam' ? 'EXAM' : 'CA';
  const maxScore = name === 'Exam' ? 80 : 10;
  const order = name === 'CA 1' ? 1 : name === 'CA 2' ? 2 : 3;
  return prisma.assessment.upsert({
    where: { offeringId_termId_name: { offeringId, termId, name } },
    update: { type, valueType: 'NUMERIC', maxScore, weight: maxScore, order },
    create: { offeringId, termId, teacherId: null, name, type, valueType: 'NUMERIC', maxScore, weight: maxScore, order },
  });
}

async function upsertScore(assessmentId, studentId, value) {
  await prisma.assessmentScore.upsert({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    update: { numericScore: value },
    create: { assessmentId, studentId, numericScore: value },
  });
}


async function insertGrades(studentId, termId, results, label) {
  console.log(`\n=== Inserting ${label} Grades ===`);
  let termTotal = 0;
  for (const [subjectName, total] of results) {
    const subjectId = SUBJECTS[subjectName];
    if (!subjectId) {
      console.log(`  Unknown subject: ${subjectName}`);
      continue;
    }
    const { ca1, ca2, exam } = splitScores(total);
    const grade = gradeFor(total);

    const offering = await ensureOffering(subjectId);
    const [a1, a2, aExam] = await Promise.all([
      ensureAssessment(offering.id, termId, 'CA 1'),
      ensureAssessment(offering.id, termId, 'CA 2'),
      ensureAssessment(offering.id, termId, 'Exam'),
    ]);

    await Promise.all([
      upsertScore(a1.id, studentId, ca1),
      upsertScore(a2.id, studentId, ca2),
      upsertScore(aExam.id, studentId, exam),
    ]);

    await prisma.subjectResult.upsert({
      where: { studentId_subjectId_termId: { studentId, subjectId, termId } },
      update: {
        classId: CLASS_ID,
        sessionId: SESSION_ID,
        totalScore: total,
        maxScore: 100,
        percentage: total,
        grade,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      create: {
        studentId,
        subjectId,
        classId: CLASS_ID,
        termId,
        sessionId: SESSION_ID,
        totalScore: total,
        maxScore: 100,
        percentage: total,
        grade,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    termTotal += total;
    console.log(`  ${subjectName}: CA1=${ca1}, CA2=${ca2}, Exam=${exam} => ${total} (${grade})`);
  }
  return termTotal;
}

async function updateTermResult(studentId, termId, termTotal, subjectCount) {
  const maxScore = subjectCount * 100;
  const average = Number((termTotal / subjectCount).toFixed(2));
  await prisma.termResult.upsert({
    where: { studentId_termId: { studentId, termId } },
    update: {
      classId: CLASS_ID,
      sessionId: SESSION_ID,
      totalScore: termTotal,
      maxScore,
      average,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    create: {
      studentId,
      classId: CLASS_ID,
      termId,
      sessionId: SESSION_ID,
      totalScore: termTotal,
      maxScore,
      average,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  console.log(`  Term ${termId} summary: total=${termTotal}, max=${maxScore}, average=${average}`);
}

async function recalculatePositions(termId) {
  const results = await prisma.termResult.findMany({
    where: { classId: CLASS_ID, sessionId: SESSION_ID, termId },
    orderBy: { totalScore: 'desc' },
  });
  for (let i = 0; i < results.length; i += 1) {
    await prisma.termResult.update({ where: { id: results[i].id }, data: { position: i + 1 } });
  }
  console.log(`  Positions recalculated for class ${CLASS_ID} term ${termId}: ${results.length} student(s)`);
}

async function main() {
  const student = await prisma.student.findUnique({
    where: { admissionNo: STUDENT_ADMISSION },
  });
  if (!student) throw new Error(`Student ${STUDENT_ADMISSION} not found`);

  const studentId = student.id;
  console.log(`Student: ${student.firstName} ${student.lastName} (${student.admissionNo})`);

  const before = {
    enrollments: await prisma.enrollment.count({ where: { studentId } }),
    sess1Subjects: await prisma.subjectResult.count({ where: { studentId, sessionId: 1 } }),
    sess1Terms: await prisma.termResult.count({ where: { studentId, sessionId: 1 } }),
    sess2Subjects: await prisma.subjectResult.count({ where: { studentId, sessionId: 2 } }),
  };
  console.log('BEFORE:', JSON.stringify(before));

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_sessionId: { studentId, sessionId: SESSION_ID } },
  });
  if (!existing) {
    await prisma.enrollment.create({
      data: { studentId, classId: CLASS_ID, sessionId: SESSION_ID, status: 'PROMOTED' },
    });
    console.log(`Created 2024/2025 enrollment: Year 7 (classId ${CLASS_ID}), status PROMOTED`);
  } else {
    console.log(`2024/2025 enrollment already exists (classId ${existing.classId})`);
  }

  for (const { termId, name } of TERM_DEFS) {
    const termTotal = await insertGrades(studentId, termId, RESULTS[termId], name);
    await updateTermResult(studentId, termId, termTotal, RESULTS[termId].length);
    await recalculatePositions(termId);
  }

  const after = {
    enrollments: await prisma.enrollment.count({ where: { studentId } }),
    sess1Subjects: await prisma.subjectResult.count({ where: { studentId, sessionId: 1 } }),
    sess1Terms: await prisma.termResult.count({ where: { studentId, sessionId: 1 } }),
    sess2Subjects: await prisma.subjectResult.count({ where: { studentId, sessionId: 2 } }),
    sess4Subjects: await prisma.subjectResult.count({ where: { studentId, sessionId: 4 } }),
    sess4Terms: await prisma.termResult.count({ where: { studentId, sessionId: 4 } }),
  };
  console.log('AFTER:', JSON.stringify(after));
  console.log('\n=== Done ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
