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
    console.log('=== YEAR 7 ENROLLMENT INVESTIGATION ===\n');
    const year7Class = await prisma.class.findFirst({ where: { name: { contains: 'YEAR 7', mode: 'insensitive' } } });
    const studentsInResults = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            classId: year7Class.id
          }
        }
      },
      include: {
        enrollments: {
          where: { classId: year7Class.id }
        }
      }
    });
    console.log('Students with YEAR 7 enrollment records:', studentsInResults.length);
    studentsInResults.forEach(s => {
      console.log('\n' + s.firstName + ' ' + s.lastName + ' (' + s.admissionNo + ')');
      s.enrollments.forEach(e => {
        console.log('  Status:', e.status);
        console.log('  Session:', e.sessionId);
      });
    });
    const allYear7Enrollments = await prisma.enrollment.findMany({
      where: { classId: year7Class.id },
      include: { student: true, session: true },
      orderBy: { enrolledAt: 'desc' }
    });
    console.log('\n=== ALL YEAR 7 ENROLLMENT RECORDS ===');
    console.log('Total:', allYear7Enrollments.length);
    allYear7Enrollments.forEach(e => {
      console.log('  ' + (e.student?.firstName || '?') + ' ' + (e.student?.lastName || '?') + ' - ' + e.status + ' (Session: ' + e.sessionId + ')');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();