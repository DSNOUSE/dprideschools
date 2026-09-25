/**
 * Repairs the academic session / term graph so all three academic years are
 * viewable without touching a single live result row.
 *
 * 2025/2026 owns the live results/assessments, so the three existing "shared"
 * terms (ids 2,3,4) are reassigned to it. 2026/2027 and 2024/2025 then get
 * their own brand-new terms. 2026/2027's assessments are re-pointed to its own
 * terms (their scores stay attached via assessmentId), and exactly one session
 * is left active.
 *
 * Run:  node scripts/repair-three-sessions.js
 */
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
} catch (err) {
  // Ignore — DATABASE_URL may already be provided by the environment.
}

const SESSION_WITH_LIVE_RESULTS = '2025/2026';
const ACTIVE_SESSION_NAME = '2026/2027';
const SHARED_TERM_IDS = [2, 3, 4];
const NEW_SESSION_NAMES = ['2024/2025'];
const TERMS = [
  { name: 'First Term', order: 1 },
  { name: 'Second Term', order: 2 },
  { name: 'Third Term', order: 3 },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await prisma.$connect();

    const sessionsBefore = await prisma.session.findMany({ orderBy: { id: 'asc' } });
    const byName = Object.fromEntries(sessionsBefore.map((s) => [s.name, s]));

    const resultsSession = byName[SESSION_WITH_LIVE_RESULTS];
    const activeSession = byName[ACTIVE_SESSION_NAME];
    if (!resultsSession) throw new Error(`Session ${SESSION_WITH_LIVE_RESULTS} not found`);
    if (!activeSession) throw new Error(`Session ${ACTIVE_SESSION_NAME} not found`);

    const before = {
      subjectResults: await prisma.subjectResult.count(),
      termResults: await prisma.termResult.count(),
      assessments: await prisma.assessment.count(),
      assessmentScores: await prisma.assessmentScore.count(),
      reports: await prisma.report.count(),
    };
    console.log('BEFORE COUNTS:', JSON.stringify(before));

    const report = {};

    await prisma.$transaction(async (tx) => {
      // 1. Reassign the shared terms to the session that owns the live results.
      const moved = await tx.term.updateMany({
        where: { id: { in: SHARED_TERM_IDS } },
        data: { sessionId: resultsSession.id },
      });
      report.termsReassigned = moved.count;
      console.log(`Step 1: ${moved.count} terms reassigned to ${SESSION_WITH_LIVE_RESULTS}`);

      // 2. Create the missing historical session + its terms.
      for (const name of NEW_SESSION_NAMES) {
        const session = await tx.session.upsert({
          where: { name },
          update: {},
          create: { name, isActive: false },
        });
        for (const term of TERMS) {
          await tx.term.upsert({
            where: { sessionId_name: { sessionId: session.id, name: term.name } },
            update: { order: term.order },
            create: { sessionId: session.id, name: term.name, order: term.order, isActive: false },
          });
        }
        console.log(`Step 2: ensured session ${name} (id ${session.id}) with 3 terms`);
      }

      // 3. Give the forward session its own terms.
      const newTermIdByOrder = {};
      for (const term of TERMS) {
        const record = await tx.term.upsert({
          where: { sessionId_name: { sessionId: activeSession.id, name: term.name } },
          update: { order: term.order },
          create: { sessionId: activeSession.id, name: term.name, order: term.order, isActive: false },
        });
        newTermIdByOrder[term.order] = record.id;
      }
      console.log(`Step 3: ${ACTIVE_SESSION_NAME} terms created: ${JSON.stringify(newTermIdByOrder)}`);

      // 4. Re-point that session's assessments onto its own terms. Scores follow
      //    through assessmentId, so nothing is lost.
      const offerings = await tx.subjectOffering.findMany({
        where: { sessionId: activeSession.id },
        select: { id: true },
      });
      const offeringIds = offerings.map((o) => o.id);
      const orderByOldTermId = { 2: 1, 3: 2, 4: 3 };
      let rePointed = 0;
      if (offeringIds.length > 0) {
        for (const oldTermId of SHARED_TERM_IDS) {
          const targetTermId = newTermIdByOrder[orderByOldTermId[oldTermId]];
          const res = await tx.assessment.updateMany({
            where: { termId: oldTermId, offeringId: { in: offeringIds } },
            data: { termId: targetTermId },
          });
          rePointed += res.count;
        }
      }
      report.assessmentsRePointed = rePointed;
      console.log(`Step 4: ${rePointed} ${ACTIVE_SESSION_NAME} assessments re-pointed`);

      // 5. Leave exactly one session flagged active.
      await tx.session.updateMany({
        where: { id: { not: activeSession.id } },
        data: { isActive: false },
      });
      await tx.session.update({ where: { id: activeSession.id }, data: { isActive: true } });
      console.log(`Step 5: ${ACTIVE_SESSION_NAME} is the only active session`);
    });

    const after = {
      subjectResults: await prisma.subjectResult.count(),
      termResults: await prisma.termResult.count(),
      assessments: await prisma.assessment.count(),
      assessmentScores: await prisma.assessmentScore.count(),
      reports: await prisma.report.count(),
    };
    console.log('AFTER COUNTS:', JSON.stringify(after));

    const lost = Object.keys(before).filter((key) => before[key] !== after[key]);
    if (lost.length > 0) {
      throw new Error(`Row counts changed unexpectedly for: ${lost.join(', ')}`);
    }
    console.log('OK: no result/assessment rows were lost');

    const sessions = await prisma.session.findMany({ orderBy: { id: 'asc' } });
    const terms = await prisma.term.findMany({ orderBy: [{ sessionId: 'asc' }, { order: 'asc' }] });
    console.log('SESSIONS:', JSON.stringify(sessions));
    console.log(
      'TERMS:',
      JSON.stringify(
        terms.map((t) => ({
          id: t.id,
          session: sessions.find((s) => s.id === t.sessionId)?.name,
          name: t.name,
          order: t.order,
        }))
      )
    );
    console.log('SUMMARY:', JSON.stringify(report));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('REPAIR FAILED:', error);
  process.exit(1);
});
