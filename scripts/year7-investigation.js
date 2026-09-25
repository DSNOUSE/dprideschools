const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.resolve(process.cwd(), '../.env');
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
    console.log('=== INVESTIGATING YEAR 7 RESULTS ===\n');
    const year7Class = await prisma.class.findFirst({
      where: { name: { contains: 'YEAR 7', mode: 'insensitive' } },
      include: { level: true }
    });
    if (!year7Class) {
      console.log('YEAR 7 class not found');
      const allClasses = await prisma.class.findMany({ include: { level: true }, orderBy: { id: 1 } });
      console.log('Available classes:', allClasses.map(c => c.name).join(', '));
    } else {
      console.log('YEAR 7 class found:', year7Class.name, 'ID:', year7Class.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { classId: year7Class.id },
        include: { student: true }
      });
      console.log('Students enrolled:', enrollments.length);
      const termResults = await prisma.termResult.findMany({
        where: { classId: year7Class.id },
        include: { term: true, session: true }
      });
      console.log('Term results:', termResults.length);
      const subjectResults = await prisma.subjectResult.findMany({
        where: { classId: year7Class.id },
        include: { subject: true, term: true }
      });
      console.log('Subject results:', subjectResults.length);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();