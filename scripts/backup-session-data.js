/**
 * Phase 0 safety net for the 3-session repair.
 *
 * Dumps every table that participates in the session/term/result graph to a
 * timestamped JSON file so the whole repair can be rolled back if needed.
 *
 * Run:  node scripts/backup-session-data.js
 */
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

// Load .env without pulling in a dependency that may not be present.
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
} catch (err) {
  // Ignore — DATABASE_URL may already be provided by the environment.
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await prisma.$connect();

    const snapshot = {
      createdAt: new Date().toISOString(),
      counts: {},
      sessions: await prisma.session.findMany({ orderBy: { id: 'asc' } }),
      terms: await prisma.term.findMany({ orderBy: { id: 'asc' } }),
      enrollments: await prisma.enrollment.findMany(),
      offerings: await prisma.subjectOffering.findMany(),
      subjectResults: await prisma.subjectResult.findMany(),
      termResults: await prisma.termResult.findMany(),
      assessments: await prisma.assessment.findMany(),
      assessmentScores: await prisma.assessmentScore.findMany(),
      reports: await prisma.report.findMany(),
    };

    snapshot.counts = {
      sessions: snapshot.sessions.length,
      terms: snapshot.terms.length,
      enrollments: snapshot.enrollments.length,
      offerings: snapshot.offerings.length,
      subjectResults: snapshot.subjectResults.length,
      termResults: snapshot.termResults.length,
      assessments: snapshot.assessments.length,
      assessmentScores: snapshot.assessmentScores.length,
      reports: snapshot.reports.length,
    };

    const dir = path.resolve(process.cwd(), 'scripts', 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(dir, `session-repair-backup-${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), 'utf8');

    console.log('BACKUP WRITTEN:', file);
    console.log('BASELINE COUNTS:', JSON.stringify(snapshot.counts));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('BACKUP FAILED:', error);
  process.exit(1);
});
