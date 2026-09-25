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
    console.log('=== CHECKING STUDENT ENROLLMENTS ===\n');
    const students = [
      { admissionNo: 'DPS43521', expectedClass: 'YEAR 7' },
      { admissionNo: 'DPS34617', expectedClass: 'YEAR 7' }
    ];
    for (const studentData of students) {
      const student = await prisma.student.findFirst({
        where: { admissionNo: studentData.admissionNo },
        include: {
          enrollments: {
            include: { class: true, session: true }
          }
        }
      });
      if (!student) {
        console.log(studentData.admissionNo + ': NOT FOUND');
        continue;
      }
      console.log(student.firstName + ' ' + student.lastName + ' (' + student.admissionNo + ')');
      console.log('  Current enrollments:', student.enrollments.length);
      const activeEnrollment = student.enrollments.find(e => e.status === 'ACTIVE');
      if (activeEnrollment) {
        console.log('  Current class:', activeEnrollment.class?.name, '(ID:', activeEnrollment.classId + ')');
        console.log('  Session:', activeEnrollment.session?.name);
        if (activeEnrollment.class?.name !== studentData.expectedClass) {
          console.log('  ❌ WRONG CLASS - Should be in', studentData.expectedClass);
        } else {
          console.log('  ✅ Correct class');
        }
      } else {
        console.log('  ⚠️  No active enrollment');
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();