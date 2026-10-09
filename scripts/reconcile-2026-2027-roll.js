#!/usr/bin/env node
/**
 * Reconcile the DPRIDE student roll to the reduced 2026/2027 list.
 *
 *   1. Carries forward existing students (matched by admissionNo) into the
 *      active 2026/2027 session, re-enrolling them in their new classes and
 *      normalising their names to the authoritative list.
 *   2. Creates the brand-new students (admissionNo: null) with continuing
 *      DPS2026xxxx admission numbers.
 *   3. Soft-withdraws (WITHDRAWN) every student NOT on the list.
 *   4. Closes out stale 2025/2026 ACTIVE enrollments (PROMOTED for kept,
 *      WITHDRAWN for removed).
 *
 * Usage:
 *   node scripts/reconcile-2026-2027-roll.js          # dry-run (no writes)
 *   node scripts/reconcile-2026-2027-roll.js --apply  # apply the changes
 */

const fs = require('fs');
const path = require('path');

// Load .env (same pattern as other maintenance scripts).
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
      const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = value;
    });
  }
} catch (err) { /* ignore */ }

const APPLY = process.argv.includes('--apply');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const ACTIVE_SESSION = '2026/2027';
const PREV_SESSION = '2025/2026';

const CLASS = {
  DISCOVERY: 'DISCOVERY CLASS (Pre-Nursery)',
  EXPLORER: 'EXPLORERS (Nursery 1)',
  YEAR_2: 'YEAR 2',
  YEAR_5: 'YEAR 5',
  YEAR_9: 'YEAR 9',
};

// The authoritative 18-student roll. admissionNo null => brand-new student.
const TARGET = [
  { admissionNo: null, firstName: 'Ruqaiyya', middleName: 'Usman', lastName: 'Imam', sex: 'FEMALE', klass: CLASS.DISCOVERY },
  { admissionNo: null, firstName: 'Abdulmumini', middleName: 'Faiz', lastName: 'Muhammad', sex: 'MALE', klass: CLASS.DISCOVERY },
  { admissionNo: null, firstName: 'Fatima', middleName: 'Mukhtar', lastName: 'Alkali', sex: 'FEMALE', klass: CLASS.EXPLORER },
  { admissionNo: 'DPS2026001', firstName: 'Fatima', middleName: 'Muhammad', lastName: 'Baba', sex: 'FEMALE', klass: CLASS.EXPLORER },
  { admissionNo: 'DPS2026002', firstName: 'Hafsat', middleName: 'Usman', lastName: 'Imam', sex: 'FEMALE', klass: CLASS.EXPLORER },
  { admissionNo: null, firstName: 'Nana', middleName: 'Aisha', lastName: 'Saad', sex: 'FEMALE', klass: CLASS.EXPLORER },
  { admissionNo: 'DPS2026013', firstName: 'Barata', middleName: null, lastName: 'Amrullah', sex: 'FEMALE', klass: CLASS.YEAR_2 },
  { admissionNo: 'DPS2026014', firstName: 'Fatima', middleName: null, lastName: 'Ibrahim', sex: 'FEMALE', klass: CLASS.YEAR_2 },
  { admissionNo: 'DPS2026015', firstName: 'Hafsat', middleName: 'Bint', lastName: 'Abubakar', sex: 'FEMALE', klass: CLASS.YEAR_2 },
  { admissionNo: 'DPS2026016', firstName: 'Aisha', middleName: null, lastName: 'Musa', sex: 'FEMALE', klass: CLASS.YEAR_5 },
  { admissionNo: 'DPS2026020', firstName: 'Muhammad', middleName: 'Arif', lastName: 'Abdallah', sex: 'MALE', klass: CLASS.YEAR_5 },
  { admissionNo: 'DPS2026018', firstName: 'Khadija', middleName: 'Usman', lastName: 'Imam', sex: 'FEMALE', klass: CLASS.YEAR_5 },
  { admissionNo: 'DPS2026027', firstName: 'Ruqaiya', middleName: 'Nasiru', lastName: 'Nabage', sex: 'FEMALE', klass: CLASS.YEAR_5 },
  { admissionNo: 'DPS2026019', firstName: 'Zainab', middleName: 'Usman', lastName: 'Imam', sex: 'FEMALE', klass: CLASS.YEAR_5 },
  { admissionNo: 'DPS2026032', firstName: 'Ali', middleName: 'Mohammed Baba', lastName: 'Mala', sex: 'MALE', klass: CLASS.YEAR_9 },
  { admissionNo: 'DPS2026036', firstName: "Umm'suleim", middleName: null, lastName: 'Ibrahim', sex: 'FEMALE', klass: CLASS.YEAR_9 },
  { admissionNo: 'DPS2026033', firstName: "Umm'salma", middleName: 'Auwal', lastName: 'Usman', sex: 'FEMALE', klass: CLASS.YEAR_9 },
  { admissionNo: 'DPS2026031', firstName: 'Nafisa', middleName: 'Usman', lastName: 'Imam', sex: 'FEMALE', klass: CLASS.YEAR_9 },
];

async function nextAdmissionNumber(prisma) {
  const students = await prisma.student.findMany({
    where: { admissionNo: { startsWith: 'DPS2026' } },
    select: { admissionNo: true },
  });
  let max = 0;
  for (const s of students) {
    const m = /^DPS2026(\d{3})$/.exec(s.admissionNo);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log(APPLY ? '== APPLY MODE ==' : '== DRY-RUN (no changes will be written) ==\n');

  try {
    const activeSession = await prisma.session.findUnique({ where: { name: ACTIVE_SESSION } });
    const prevSession = await prisma.session.findUnique({ where: { name: PREV_SESSION } });
    if (!activeSession) throw new Error(`Session "${ACTIVE_SESSION}" not found.`);
    if (!prevSession) throw new Error(`Session "${PREV_SESSION}" not found.`);

    const classIdByName = {};
    for (const name of Object.values(CLASS)) {
      const c = await prisma.class.findFirst({ where: { name } });
      if (!c) throw new Error(`Class "${name}" not found.`);
      classIdByName[name] = c.id;
    }

    // Assign continuing admission numbers to brand-new students.
    let nextNo = await nextAdmissionNumber(prisma);
    const newStudents = [];
    for (const t of TARGET) {
      if (!t.admissionNo) {
        newStudents.push({ ...t, admissionNo: `DPS2026${String(nextNo++).padStart(3, '0')}` });
      }
    }
    const fullTarget = TARGET.map((t) => (t.admissionNo ? { ...t } : newStudents.shift()));

    const keepSet = new Set(fullTarget.map((t) => t.admissionNo));
    const allStudents = await prisma.student.findMany({
      include: { enrollments: { include: { session: true, class: true } } },
    });

    const log = (msg) => console.log(msg);

    // --- 1 & 2: carry forward existing + create new ---
    for (const t of fullTarget) {
      const classId = classIdByName[t.klass];
      let student = await prisma.student.findUnique({ where: { admissionNo: t.admissionNo } });

      if (student) {
        const nameChanged =
          student.firstName !== t.firstName ||
          (student.middleName ?? null) !== (t.middleName ?? null) ||
          student.lastName !== t.lastName ||
          student.sex !== t.sex;

        if (nameChanged) {
          log(`UPDATE ${t.admissionNo}: "${student.firstName} ${student.middleName || ''} ${student.lastName}" -> "${t.firstName} ${t.middleName || ''} ${t.lastName}"`);
          if (APPLY) {
            student = await prisma.student.update({
              where: { id: student.id },
              data: { firstName: t.firstName, middleName: t.middleName, lastName: t.lastName, sex: t.sex },
            });
          }
        } else {
          log(`KEEP   ${t.admissionNo}: ${student.firstName} ${student.middleName || ''} ${student.lastName} (unchanged)`);
        }

        const existing = await prisma.enrollment.findUnique({
          where: { studentId_sessionId: { studentId: student.id, sessionId: activeSession.id } },
        });
        if (existing) {
          if (existing.classId !== classId || existing.status !== 'ACTIVE') {
            log(`  -> ENROL into ${t.klass} (${ACTIVE_SESSION}) [update existing]`);
            if (APPLY) await prisma.enrollment.update({ where: { id: existing.id }, data: { classId, status: 'ACTIVE', withdrawnAt: null } });
          } else {
            log(`  -> already ACTIVE in ${t.klass} (${ACTIVE_SESSION})`);
          }
        } else {
          log(`  -> ENROL into ${t.klass} (${ACTIVE_SESSION})`);
          if (APPLY) await prisma.enrollment.create({ data: { studentId: student.id, sessionId: activeSession.id, classId, status: 'ACTIVE' } });
        }
      } else {
        log(`CREATE ${t.admissionNo}: ${t.firstName} ${t.middleName || ''} ${t.lastName} (${t.sex}) -> ${t.klass}`);
        if (APPLY) {
          await prisma.student.create({
            data: {
              admissionNo: t.admissionNo,
              firstName: t.firstName,
              middleName: t.middleName,
              lastName: t.lastName,
              sex: t.sex,
              enrollments: { create: { sessionId: activeSession.id, classId, status: 'ACTIVE' } },
            },
          });
        }
      }
    }

    // --- 3 & 4: close out prior-session ACTIVE + withdraw removed ---
    for (const student of allStudents) {
      const isKept = keepSet.has(student.admissionNo);
      for (const enr of student.enrollments) {
        if (enr.status !== 'ACTIVE') continue;
        if (isKept) {
          if (enr.session.name !== ACTIVE_SESSION) {
            log(`PROMOTE ${student.admissionNo} from ${enr.class.name} (${enr.session.name})`);
            if (APPLY) await prisma.enrollment.update({ where: { id: enr.id }, data: { status: 'PROMOTED' } });
          }
        } else {
          log(`WITHDRAW ${student.admissionNo} (${enr.class.name} / ${enr.session.name})`);
          if (APPLY) await prisma.enrollment.update({ where: { id: enr.id }, data: { status: 'WITHDRAWN', withdrawnAt: new Date() } });
        }
      }
    }

    // --- validation summary ---
    const finalActive = await prisma.enrollment.findMany({
      where: { status: 'ACTIVE' },
      include: { student: true, session: true, class: true },
      orderBy: [{ class: { sortOrder: 'asc' } }, { student: { lastName: 'asc' } }],
    });

    console.log('\n=== FINAL ACTIVE ROLL (dry-run = projected) ===');
    for (const e of finalActive) {
      console.log(`  ${e.student.admissionNo}  ${e.student.firstName} ${e.student.middleName || ''} ${e.student.lastName}  -> ${e.class.name} (${e.session.name})`);
    }
    console.log(`\nTotal ACTIVE students: ${finalActive.length} (expected ${fullTarget.length})`);

    const prevActive = await prisma.enrollment.count({ where: { status: 'ACTIVE', sessionId: prevSession.id } });
    console.log(`Remaining ACTIVE in ${PREV_SESSION}: ${prevActive} (expected 0)`);

    await prisma.$disconnect();
    await pool.end();

    if (!APPLY) console.log('\nDry-run complete. No changes written. Re-run with --apply to apply.');
  } catch (err) {
    console.error('ERROR:', err.message || err);
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();

