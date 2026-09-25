const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      const unquoted = value.replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = unquoted;
    });
  }
} catch (err) {}
async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.$connect();
    console.log('=== FIXING YEAR 7 ENROLLMENTS ===\n');
    const year7Class = await prisma.class.findFirst({ where: { name: { contains: 'YEAR 7', mode: 'insensitive' } } });
    const year8Class = await prisma.class.findFirst({ where: { name: { contains: 'YEAR 8', mode: 'insensitive' } } });
    console.log('YEAR 7 Class ID:', year7Class.id);
    console.log('YEAR 8 Class ID:', year8Class.id);
    console.log('');
    const students = [
      { admissionNo: 'DPS43521', name: 'Aisha Muhammad' },
      { admissionNo: 'DPS34617', name: 'Imam Nafisa' }
    ];
    for (const studentData of students) {
      const student = await prisma.student.findFirst({ where: { admissionNo: studentData.admissionNo } });
      if (!student) {
        console.log(studentData.admissionNo + ': NOT FOUND');
        continue;
      }
      console.log('Fixing', studentData.name + '...');
      const year8Enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, classId: year8Class.id, status: 'ACTIVE' }
      });
      if (year8Enrollment) {
        await prisma.enrollment.update({
          where: { id: year8Enrollment.id },
          data: { classId: year7Class.id }
        });
        console.log('  ✅ Moved from YEAR 8 to YEAR 7');
      } else {
        console.log('  ⚠️  No active YEAR 8 enrollment found');
      }
      const year7Enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, classId: year7Class.id, status: 'ACTIVE' }
      });
      if (year7Enrollment) {
        console.log('  ✅ YEAR 7 enrollment confirmed (ID:', year7Enrollment.id + ')');
      }
      console.log('');
    }
    console.log('=== UPDATING TERM RESULTS ===');
    const termResults = await prisma.termResult.findMany({
      where: { classId: year8Class.id },
      include: { student: true }
    });
    console.log('Found', termResults.length, 'term results in YEAR 8');
    let movedCount = 0;
    for (const tr of termResults) {
      if (tr.student?.admissionNo === 'DPS43521' || tr.student?.admissionNo === 'DPS34617') {
        await prisma.termResult.update({
          where: { id: tr.id },
          data: { classId: year7Class.id }
        });
        movedCount++;
      }
    }
    console.log('Moved', movedCount, 'term results to YEAR 7');
    console.log('');
    console.log('=== UPDATING SUBJECT RESULTS ===');
    const subjectResults = await prisma.subjectResult.findMany({
      where: { classId: year8Class.id },
      include: { student: true }
    });
    console.log('Found', subjectResults.length, 'subject results in YEAR 8');
    let movedSubjectCount = 0;
    for (const sr of subjectResults) {
      if (sr.student?.admissionNo === 'DPS43521' || sr.student?.admissionNo === 'DPS34617') {
        await prisma.subjectResult.update({
          where: { id: sr.id },
          data: { classId: year7Class.id }
        });
        movedSubjectCount++;
      }
    }
    console.log('Moved', movedSubjectCount, 'subject results to YEAR 7');
    console.log('');
    console.log('=== VERIFICATION ===');
    const verifyEnrollments = await prisma.enrollment.findMany({
      where: { classId: year7Class.id, status: 'ACTIVE' },
      include: { student: true }
    });
    console.log('YEAR 7 now has', verifyEnrollments.length, 'active students');
    verifyEnrollments.forEach(e => {
      console.log('  -', e.student?.firstName, e.student?.lastName, '(' + e.student?.admissionNo + ')');
    });
    const verifyTermResults = await prisma.termResult.count({ where: { classId: year7Class.id } });
    const verifySubjectResults = await prisma.subjectResult.count({ where: { classId: year7Class.id } });
    console.log('\nYEAR 7 now has');
    console.log('  -', verifyTermResults, 'term results');
    console.log('  -', verifySubjectResults, 'subject results');
    console.log('\n✅ Fix completed!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();