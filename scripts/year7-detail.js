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
    console.log('=== DETAILED YEAR 7 INVESTIGATION ===\n');
    const year7Class = await prisma.class.findFirst({ where: { name: { contains: 'YEAR 7', mode: 'insensitive' } } });
    console.log('YEAR 7 Class ID:', year7Class.id);
    console.log('');
    const termResults = await prisma.termResult.findMany({ where: { classId: year7Class.id }, include: { term: true, session: true } });
    console.log('TERM RESULTS:', termResults.length);
    termResults.forEach(tr => console.log('  ' + (tr.term?.name || '?') + ' ' + (tr.session?.name || '?') + ': avg=' + tr.averageScore + ' status=' + tr.status));
    const subjectResults = await prisma.subjectResult.findMany({ where: { classId: year7Class.id }, include: { subject: true, term: true }, take: 20 });
    console.log('\nSUBJECT RESULTS (sample):', subjectResults.length);
    const byTerm = {};
    subjectResults.forEach(sr => {
      const t = sr.term?.name || 'Unknown';
      if (!byTerm[t]) byTerm[t] = [];
      byTerm[t].push(sr);
    });
    Object.keys(byTerm).forEach(term => {
      console.log('\n' + term + ':');
      byTerm[term].forEach(sr => console.log('  ' + sr.subject?.name + ': ' + sr.numericScore + ' (' + sr.status + ')'));
    });
    const studentIds = new Set(subjectResults.map(sr => sr.studentId));
    console.log('\nSTUDENTS IN RESULTS:', studentIds.size);
    for (const sid of studentIds) {
      const student = await prisma.student.findUnique({ where: { id: sid } });
      console.log('  -', student?.firstName, student?.lastName, '(' + student?.admissionNo + ')');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();