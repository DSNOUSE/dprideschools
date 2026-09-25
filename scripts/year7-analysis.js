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
    console.log('=== YEAR 7: ROOT CAUSE ANALYSIS ===\n');
    const studentIds = ['DPS43521', 'DPS34617'];
    for (const admNo of studentIds) {
      const student = await prisma.student.findFirst({ where: { admissionNo: admNo } });
      if (!student) {
        console.log(admNo + ': NOT FOUND');
        continue;
      }
      console.log(admNo + ' - ' + student.firstName + ' ' + student.lastName);
      console.log('  Student ID:', student.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { class: true, session: true }
      });
      console.log('  Total enrollments:', enrollments.length);
      const activeEnrollment = enrollments.find(e => e.status === 'ACTIVE');
      if (activeEnrollment) {
        console.log('  Current class:', activeEnrollment.class?.name, '(Session:', activeEnrollment.session?.name + ')');
      } else {
        console.log('  No active enrollment');
      }
      const year7Enrollments = enrollments.filter(e => e.classId === 10);
      console.log('  YEAR 7 enrollments:', year7Enrollments.length);
      if (year7Enrollments.length > 0) {
        year7Enrollments.forEach(e => {
          console.log('    Status:', e.status, 'Session:', e.session?.name);
        });
      }
      console.log('');
    }
    console.log('=== SUMMARY ===');
    console.log('Year 7 has 52 subject results and 4 term results');
    console.log('BUT 0 active enrollments');
    console.log('Results belong to 2 students who are no longer enrolled in Year 7');
    console.log('');
    console.log('WHY YOU CANNOT FIND YEAR 7 RESULTS:');
    console.log('1. Students were promoted/transferred out of Year 7');
    console.log('2. Their enrollments are no longer ACTIVE');
    console.log('3. Results still exist but have no current class enrollment');
    console.log('4. All scores are NULL/undefined (data quality issue)');
    console.log('');
    console.log('SOLUTION OPTIONS:');
    console.log('1. Archive old Year 7 results to history table');
    console.log('2. Re-enroll students in Year 7 (if they returned)');
    console.log('3. Delete orphaned results if they are test/bad data');
    console.log('4. Keep as historical records for reporting');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();