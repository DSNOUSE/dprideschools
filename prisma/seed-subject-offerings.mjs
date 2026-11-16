// prisma/seed-subject-offerings.mjs
// Idempotent seeder: upsert SubjectOffering rows for the active session (2026/2027).
// Uses ONLY ESM `import` — no `require`.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('DATABASE_URL is not set'); process.exit(1); }

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const EARLY_YEARS_SUBJECTS = [
  'Numbers', 'Letters', 'Elementary Science', 'Social Moral Studies',
  'Arabic Language', 'Picture Reading & Rhymes', 'Phonics & Spellings'
];

const PRIMARY_SECONDARY_SUBJECTS = [
  'Mathematics', 'Cultural and Creative Art (CCA)', 'Vocabulary/Spellings',
  'English', 'History', 'Pre-Vocational Studies (PVS)', 'Basic and Science Technology (BST)',
  'IRK', 'Business Studies', 'National Value (NVE)', 'Hausa', 'French', 'Literature'
];

const SKIP_CLASS_NAMES = new Set(['Primary 1']);

async function resolveSubjects(names) {
  const map = {};
  for (const name of names) {
    const s = await prisma.subject.upsert({
      where: { name },
      create: { name, isActive: true },
      update: {}
    });
    map[name] = s.id;
  }
  return map;
}

async function main() {
  // Active session
  const session = await prisma.session.findFirst({
    where: { isActive: true },
    orderBy: { id: 'desc' }
  });
  if (!session) throw new Error('No active session');
  console.log(`Session: ${session.name} (id ${session.id})`);

  // Group classes by section (no hardcoded IDs)
  const classes = await prisma.class.findMany({ include: { level: true } });
  const earlyYears = [], primarySecondary = [];
  for (const c of classes) {
    if (SKIP_CLASS_NAMES.has(c.name)) { console.log(`Skipping stray class "${c.name}" (id ${c.id})`); continue; }
    const section = c.level?.section;
    if (section === 'EARLY_YEARS') earlyYears.push(c);
    else if (section === 'PRIMARY' || section === 'SECONDARY') primarySecondary.push(c);
  }
  console.log(`Classes in scope: ${earlyYears.length} early-years, ${primarySecondary.length} primary/secondary`);

  // Resolve subjects once
  const earlyMap = await resolveSubjects(EARLY_YEARS_SUBJECTS);
  const psMap = await resolveSubjects(PRIMARY_SECONDARY_SUBJECTS);

  // Build the write plan
  const plan = [];
  for (const c of earlyYears) for (const n of EARLY_YEARS_SUBJECTS)
    plan.push({ classId: c.id, subjectId: earlyMap[n], name: n });
  for (const c of primarySecondary) for (const n of PRIMARY_SECONDARY_SUBJECTS)
    plan.push({ classId: c.id, subjectId: psMap[n], name: n });

  console.log(`Expected total: ${plan.length}`);

  // Upsert offerings (idempotent via the unique key)
  let created = 0, skipped = 0;
  for (const item of plan) {
    const existing = await prisma.subjectOffering.findUnique({
      where: {
        subjectId_classId_sessionId: {
          subjectId: item.subjectId,
          classId: item.classId,
          sessionId: session.id
        }
      }
    });
    if (existing) {
      skipped++;
    } else {
      await prisma.subjectOffering.create({
        data: {
          subjectId: item.subjectId,
          classId: item.classId,
          sessionId: session.id,
          isCompulsory: true,
          isActive: true
        }
      });
      created++;
    }
  }

  // Verify and report
  const verify = (ids) => prisma.subjectOffering.count({
    where: { sessionId: session.id, classId: { in: ids }, isActive: true }
  });
  const earlyCount = await verify(earlyYears.map(c => c.id));
  const psCount = await verify(primarySecondary.map(c => c.id));

  console.log(`Created ${created}, skipped ${skipped} (already present)`);
  console.log(`Early Years active offerings: ${earlyCount} (expected ${earlyYears.length * 7})`);
  console.log(`Primary/Secondary active offerings: ${psCount} (expected ${primarySecondary.length * 13})`);

  if (earlyCount !== earlyYears.length * 7) throw new Error('Early Years count mismatch');
  if (psCount !== primarySecondary.length * 13) throw new Error('Primary/Secondary count mismatch');

  console.log('✅ Seed complete and verified.');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
  });
