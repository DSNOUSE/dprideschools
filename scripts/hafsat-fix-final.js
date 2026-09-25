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
    await prisma.connect();
    const hafsat = await prisma.student.findFirst({ where: { firstName: 'Hafsat' } });
    console.log('Fix 1: Class mismatch');
    const res = await prisma.subjectResult.updateMany({ where: { studentId: hafsat.id, termId: 2, classId: 6 }, data: { classId: 5 } });
    console.log('Updated ' + res.count + ' results');
    const tr = await prisma.termResult.findFirst({ where: { studentId: hafsat.id, termId: 2 } });
    if (tr && tr.classId === 6) {
      await prisma.termResult.update({ where: { id: tr.id }, data: { classId: 5 } });
      console.log('Updated term result');
    }
    console.log('Fix 2: Flag invalid scores');
    const english = await prisma.subjectResult.findFirst({ where: { studentId: hafsat.id, termId: 2, subjectId: 1 } });
    if (english && english.numericScore > 100) {
      console.log('FLAGGED: English score ' + english.numericScore + ' exceeds 100');
    }
    console.log('Fix 3: Publish Third Term');
    const thirdTerm = await prisma.termResult.findFirst({ where: { studentId: hafsat.id, termId: 3 } });
    if (thirdTerm && thirdTerm.status === 'DRAFT') {
      await prisma.termResult.update({ where: { id: thirdTerm.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
      const subj = await prisma.subjectResult.updateMany({ where: { studentId: hafsat.id, termId: 3, status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      console.log('Published ' + subj.count + ' subject results');
    }
    console.log('Fix 4: Check duplicates');
    const allResults = await prisma.subjectResult.findMany({ where: { studentId: hafsat.id } });
    const dups = {};
    allResults.forEach(r => { const k = r.termId + '_' + r.classId + '_' + r.subjectId; if (!dups[k]) dups[k] = []; dups[k].push(r); });
    let removed = 0;
    for (const k in dups) {
      if (dups[k].length > 1) {
        for (let i = 1; i < dups[k].length; i++) {
          await prisma.subjectResult.delete({ where: { id: dups[k][i].id } });
          removed++;
        }
      }
    }
    console.log('Removed ' + removed + ' duplicates');
    console.log('Fix 5: Summary');
    const terms = await prisma.termResult.findMany({ where: { studentId: hafsat.id }, include: { term: true } });
    const subjects = await prisma.subjectResult.findMany({ where: { studentId: hafsat.id } });
    console.log('Student: ' + hafsat.firstName + ' ' + hafsat.lastName);
    terms.forEach(t => console.log('  ' + (t.term?.name || 'N/A') + ': avg=' + t.averageScore + ' status=' + t.status));
    console.log('Total subject results: ' + subjects.length);
    console.log('All fixes complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.disconnect();
    await pool.end();
  }
}
main();