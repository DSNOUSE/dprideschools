import 'dotenv/config';
import { prisma } from '../src/lib/prisma.ts';

const ADMISSION = 'DPS39419';
const SESSION_ID = 1;
const CLASS_ID = 11;
const TERM_ID = 1;
const DELTAS = [-4, -3, -2, -1, -2, -3, -1, -2, -3, -4, -2, -1, -3];
const REMARK = 'A good start to the session. Keep working hard.';

function gradeFor(score) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

function splitScores(total) {
  const first = Math.max(5, Math.min(20, Math.round(total * 0.2)));
  const second = Math.max(5, Math.min(20, Math.round(total * 0.22)));
  let exam = total - first - second;
  exam = Math.max(20, Math.min(60, exam));
  return { first, second, exam, average: first + second + exam };
}

async function ensureOffering(subjectId) {
  return prisma.subjectOffering.upsert({
    where: { subjectId_classId_sessionId: { subjectId, classId: CLASS_ID, sessionId: SESSION_ID } },
    update: { isActive: true },
    create: { subjectId, classId: CLASS_ID, sessionId: SESSION_ID, isCompulsory: true, isActive: true },
  });
}

async function ensureAssessment(offeringId, name, teacherId) {
  const type = name === 'Exam' ? 'EXAM' : 'CA';
  const maxScore = name === 'Exam' ? 60 : 20;
  const order = name === 'CA 1' ? 1 : name === 'CA 2' ? 2 : 3;
  return prisma.assessment.upsert({
    where: { offeringId_termId_name: { offeringId, termId: TERM_ID, name } },
    update: { type, valueType: 'NUMERIC', maxScore, weight: maxScore, order, ...(teacherId ? { teacherId } : {}) },
    create: { offeringId, termId: TERM_ID, teacherId, name, type, valueType: 'NUMERIC', maxScore, weight: maxScore, order },
  });
}

async function upsertScore(assessmentId, studentId, value) {
  await prisma.assessmentScore.upsert({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    update: { numericScore: value },
    create: { assessmentId, studentId, numericScore: value },
  });
}

async function main() {
  const student = await prisma.student.findFirst({
    where: { admissionNo: ADMISSION },
    include: { enrollments: { where: { sessionId: SESSION_ID, classId: CLASS_ID } } },
  });
  if (!student) throw new Error(`Student ${ADMISSION} not found in this database`);
  if (student.enrollments.length === 0) throw new Error('No Year 8 / 2025-2026 enrollment');

  const existing = await prisma.subjectResult.count({
    where: { studentId: student.id, classId: CLASS_ID, sessionId: SESSION_ID, termId: TERM_ID },
  });
  if (existing > 0) throw new Error(`First term already has ${existing} subject results; refusing to overwrite`);

  const secondTerm = await prisma.subjectResult.findMany({
    where: { studentId: student.id, classId: CLASS_ID, sessionId: SESSION_ID, termId: 2, status: 'PUBLISHED' },
    include: { subject: true },
    orderBy: { subject: { name: 'asc' } },
  });
  if (secondTerm.length !== 13) throw new Error(`Expected 13 second-term subjects, found ${secondTerm.length}`);

  const teacherId = secondTerm.find((row) => row.teacherId)?.teacherId ?? null;
  console.log(`Student ${student.firstName} ${student.lastName} (${student.admissionNo}) ${student.id}`);

  const written = [];
  for (let i = 0; i < secondTerm.length; i += 1) {
    const source = secondTerm[i];
    const target = Math.max(45, Math.min(95, Number(source.totalScore) + DELTAS[i]));
    const scores = splitScores(target);
    const offering = await ensureOffering(source.subjectId);
    const [ca1, ca2, exam] = await Promise.all([
      ensureAssessment(offering.id, 'CA 1', teacherId),
      ensureAssessment(offering.id, 'CA 2', teacherId),
      ensureAssessment(offering.id, 'Exam', teacherId),
    ]);
    await Promise.all([
      upsertScore(ca1.id, student.id, scores.first),
      upsertScore(ca2.id, student.id, scores.second),
      upsertScore(exam.id, student.id, scores.exam),
    ]);
    const grade = gradeFor(scores.average);
    await prisma.subjectResult.create({
      data: {
        studentId: student.id,
        subjectId: source.subjectId,
        classId: CLASS_ID,
        termId: TERM_ID,
        sessionId: SESSION_ID,
        totalScore: scores.average,
        maxScore: 100,
        percentage: scores.average,
        grade,
        rating: grade,
        status: 'PUBLISHED',
        teacherId,
        publishedAt: new Date(),
      },
    });
    written.push({ subject: source.subject.name, ...scores, grade });
    console.log(`${source.subject.name}: ${scores.first}+${scores.second}+${scores.exam}=${scores.average} (${grade})`);
  }

  const totalScore = written.reduce((sum, row) => sum + row.average, 0);
  const average = Number((totalScore / written.length).toFixed(2));
  const classmates = await prisma.termResult.findMany({
    where: { classId: CLASS_ID, sessionId: SESSION_ID, termId: TERM_ID, status: 'PUBLISHED' },
    select: { totalScore: true },
  });
  const position = classmates.filter((row) => Number(row.totalScore) > totalScore).length + 1;

  await prisma.termResult.create({
    data: {
      studentId: student.id,
      classId: CLASS_ID,
      termId: TERM_ID,
      sessionId: SESSION_ID,
      totalScore,
      maxScore: written.length * 100,
      average,
      position,
      status: 'PUBLISHED',
      classTeacherRemark: REMARK,
      publishedAt: new Date(),
    },
  });

  const termResult = await prisma.termResult.findUnique({
    where: { studentId_termId: { studentId: student.id, termId: TERM_ID } },
  });
  await prisma.report.upsert({
    where: { studentId_termId: { studentId: student.id, termId: TERM_ID } },
    update: { teacherRemark: REMARK, status: 'PUBLISHED', termResultId: termResult.id, publishedAt: new Date() },
    create: {
      studentId: student.id,
      termId: TERM_ID,
      termResultId: termResult.id,
      teacherId,
      teacherRemark: REMARK,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log(`Term summary: total=${totalScore}, average=${average}, position=${position}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
