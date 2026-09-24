import 'dotenv/config';
import { prisma } from '../src/lib/prisma.ts';

const STUDENT_ADMISSION = 'DPS2026034';
const SESSION_ID = 1;
const CLASS_ID = 12;
const TERM_2ND = 3;
const TERM_3RD = 4;

const SUBJECTS = {
  'Basic and Science Technology (BST)': 14,
  'Business Studies': 18,
  'Cultural and Creative Art (CCA)': 8,
  'English': 11,
  'French': 22,
  'Hausa': 21,
  'History': 12,
  'IRK': 15,
  'Literature': 23,
  'Mathematics': 7,
  'National Value (NVE)': 20,
  'Pre-Vocational Studies (PVS)': 13,
  'Vocabulary/Spellings': 9,
};

const TERM_2ND_RESULTS = [
  { subject: 'Basic and Science Technology (BST)', first: 14, second: 16, exam: 44, average: 74.0, grade: 'B' },
  { subject: 'Business Studies', first: 10, second: 11, exam: 34, average: 55.0, grade: 'C' },
  { subject: 'Cultural and Creative Art (CCA)', first: 11, second: 12, exam: 33, average: 56.0, grade: 'C' },
  { subject: 'English', first: 15, second: 15, exam: 42, average: 72.0, grade: 'B' },
  { subject: 'French', first: 14, second: 15, exam: 44, average: 73.0, grade: 'B' },
  { subject: 'Hausa', first: 18, second: 19, exam: 56, average: 93.0, grade: 'A' },
  { subject: 'History', first: 13, second: 13, exam: 36, average: 62.0, grade: 'B' },
  { subject: 'IRK', first: 12, second: 14, exam: 39, average: 65.0, grade: 'B' },
  { subject: 'Literature', first: 13, second: 13, exam: 44, average: 70.0, grade: 'B' },
  { subject: 'Mathematics', first: 13, second: 14, exam: 40, average: 67.0, grade: 'B' },
  { subject: 'National Value (NVE)', first: 11, second: 12, exam: 35, average: 58.0, grade: 'C' },
  { subject: 'Pre-Vocational Studies (PVS)', first: 14, second: 16, exam: 44, average: 74.0, grade: 'B' },
  { subject: 'Vocabulary/Spellings', first: 19, second: 18, exam: 55, average: 92.0, grade: 'A' },
];

const TERM_3RD_RESULTS = [
  { subject: 'Basic and Science Technology (BST)', first: 15, second: 16, exam: 45, average: 76.0, grade: 'B' },
  { subject: 'Business Studies', first: 12, second: 12, exam: 38, average: 62.0, grade: 'B' },
  { subject: 'Cultural and Creative Art (CCA)', first: 12, second: 13, exam: 35, average: 60.0, grade: 'B' },
  { subject: 'English', first: 15, second: 16, exam: 44, average: 75.0, grade: 'B' },
  { subject: 'French', first: 15, second: 15, exam: 45, average: 75.0, grade: 'B' },
  { subject: 'Hausa', first: 19, second: 19, exam: 57, average: 95.0, grade: 'A' },
  { subject: 'History', first: 14, second: 13, exam: 38, average: 65.0, grade: 'B' },
  { subject: 'IRK', first: 13, second: 14, exam: 41, average: 68.0, grade: 'B' },
  { subject: 'Literature', first: 14, second: 14, exam: 45, average: 73.0, grade: 'B' },
  { subject: 'Mathematics', first: 14, second: 14, exam: 42, average: 70.0, grade: 'B' },
  { subject: 'National Value (NVE)', first: 12, second: 13, exam: 37, average: 62.0, grade: 'B' },
  { subject: 'Pre-Vocational Studies (PVS)', first: 15, second: 16, exam: 45, average: 76.0, grade: 'B' },
  { subject: 'Vocabulary/Spellings', first: 19, second: 19, exam: 56, average: 94.0, grade: 'A' },
];

async function ensureOffering(subjectId, classId, sessionId) {
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

async function ensureAssessment(offeringId, termId, name, teacherId) {
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

async function upsertScore(assessmentId, studentId, value) {
  if (value == null) {
    await prisma.assessmentScore.deleteMany({ where: { assessmentId, studentId } });
    return;
  }
  await prisma.assessmentScore.upsert({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    update: { numericScore: value },
    create: { assessmentId, studentId, numericScore: value },
  });
}

async function insertGrades(studentId, termId, results, label) {
  console.log(`\\n=== Inserting ${label} Grades ===`);
  
  for (const result of results) {
    const subjectId = SUBJECTS[result.subject];
    if (!subjectId) {
      console.log(`  Unknown subject: ${result.subject}`);
      continue;
    }

    const offering = await ensureOffering(subjectId, CLASS_ID, SESSION_ID);
    const [a1, a2, aExam] = await Promise.all([
      ensureAssessment(offering.id, termId, 'CA 1', null),
      ensureAssessment(offering.id, termId, 'CA 2', null),
      ensureAssessment(offering.id, termId, 'Exam', null),
    ]);

    await Promise.all([
      upsertScore(a1.id, studentId, result.first),
      upsertScore(a2.id, studentId, result.second),
      upsertScore(aExam.id, studentId, result.exam),
    ]);

    await prisma.subjectResult.upsert({
      where: {
        studentId_subjectId_termId: { studentId, subjectId, termId },
      },
      update: {
        classId: CLASS_ID,
        sessionId: SESSION_ID,
        totalScore: result.average,
        maxScore: 100,
        percentage: result.average,
        grade: result.grade,
        status: 'DRAFT',
      },
      create: {
        studentId,
        subjectId,
        classId: CLASS_ID,
        termId,
        sessionId: SESSION_ID,
        totalScore: result.average,
        maxScore: 100,
        percentage: result.average,
        grade: result.grade,
        status: 'DRAFT',
      },
    });

    console.log(`  ${result.subject}: 1st=${result.first}, 2nd=${result.second}, Exam=${result.exam}, Avg=${result.average}, Grade=${result.grade}`);
  }
}

async function updateTermResult(studentId, termId) {
  const subjectResults = await prisma.subjectResult.findMany({
    where: { studentId, classId: CLASS_ID, termId, sessionId: SESSION_ID },
  });
  
  if (subjectResults.length === 0) {
    console.log(`  No subject results found for term ${termId}`);
    return;
  }

  const totalScore = subjectResults.reduce((sum, row) => sum + Number(row.totalScore ?? row.percentage ?? 0), 0);
  const average = totalScore / subjectResults.length;
  const maxScore = subjectResults.length * 100;

  await prisma.termResult.upsert({
    where: {
      studentId_termId: { studentId, termId },
    },
    update: {
      classId: CLASS_ID,
      sessionId: SESSION_ID,
      average,
      totalScore,
      maxScore,
      status: 'DRAFT',
    },
    create: {
      studentId,
      classId: CLASS_ID,
      termId,
      sessionId: SESSION_ID,
      average,
      totalScore,
      maxScore,
      status: 'DRAFT',
    },
  });

  console.log(`\\n  Term Summary: Total=${totalScore.toFixed(1)}, Max=${maxScore}, Average=${average.toFixed(2)}`);
}

async function main() {
  try {
    const student = await prisma.student.findFirst({
      where: { admissionNo: STUDENT_ADMISSION },
      include: {
        enrollments: {
          where: { sessionId: SESSION_ID },
        },
      },
    });

    if (!student || !student.enrollments || student.enrollments.length === 0) {
      console.log('Student or enrollment not found');
      return;
    }

    const enrollment = student.enrollments[0];
    const studentId = student.id;

    console.log(`Student: ${student.firstName} ${student.lastName} (ID: ${studentId})`);
    console.log(`   Class: ${enrollment.classId}, Session: ${SESSION_ID} (2025/2026)`);

    await insertGrades(studentId, TERM_2ND, TERM_2ND_RESULTS, '2nd Term');
    await updateTermResult(studentId, TERM_2ND);

    await insertGrades(studentId, TERM_3RD, TERM_3RD_RESULTS, '3rd Term');
    await updateTermResult(studentId, TERM_3RD);

    console.log('\\n=== All grades inserted successfully ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
