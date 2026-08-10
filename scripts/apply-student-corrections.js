/**
 * Complete student correction from official register.
 * Updates: admissionNo, name parts, sex, class enrollment.
 * Admission format: DPS + digits from register (354/17 -> DPS35417)
 *
 * Usage: node scripts/apply-student-corrections.js
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return norm(s).split(' ').filter(Boolean);
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], middleName: null, lastName: parts[0] };
  if (parts.length === 2) return { firstName: parts[0], middleName: null, lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

function regToAdmission(reg) {
  // 354/17 -> DPS35417
  const digits = String(reg).replace(/[^0-9]/g, '');
  return `DPS${digits}`;
}

function scoreMatch(targetName, student) {
  const t = tokens(targetName);
  const db = tokens([student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '));
  if (!t.length || !db.length) return 0;

  // All target tokens found in db name (order-insensitive)
  const dbJoined = db.join(' ');
  let hit = 0;
  for (const part of t) {
    if (db.includes(part) || dbJoined.includes(part)) hit += 1;
  }
  // Bonus if first token matches first name
  let score = hit / t.length;
  if (t[0] === db[0]) score += 0.15;
  // Bonus if last token matches last name
  if (t[t.length - 1] === db[db.length - 1]) score += 0.15;
  return score;
}

function resolveClassId(classes, classKey) {
  const key = classKey.toUpperCase();
  const find = (pred) => classes.find(pred);

  if (key === 'DISCOVERY') return find((c) => /discovery/i.test(c.name))?.id;
  if (key === 'EXPLORERS') return find((c) => /explorer/i.test(c.name))?.id;
  if (key === 'PREPARATORY' || key === 'PRE') return find((c) => /preparatory/i.test(c.name))?.id;
  if (key.startsWith('YEAR')) {
    const n = key.replace(/\D/g, '');
    return find((c) => new RegExp(`year\\s*${n}\\b`, 'i').test(c.name))?.id;
  }
  return null;
}

// Known aliases: official name -> likely DB full name fragments for matching
const aliases = {
  "ummusalma awal usman": ["hanan auwal", "ummusalma", "auwal usman"],
  "ummusuleim ibrahim": ["ummsuleim ibrahim", "umm suleim ibrahim", "ummusuleim ibrahim"],
  "ali mohammed bm": ["ali mohammed b m", "ali mohammed bm", "ali mohammed b.m"],
  "saad fatima": ["saad fatima", "sa'ad fatima"],
  "ahmad abdullahi garba": ["ahmed abdullahi garba", "ahmad abdullahi garba"],
  "nabage rugayya nazir": ["nabage ruqaiya nasiru", "nabage rugayya nazir", "ruqaiya"],
  "bilal sani shehu": ["bilal sani", "bilal sani shehu"],
  "bilkisu sani shehu": ["bilikisu sani shehu", "bilkisu sani shehu"],
  "khadija usman imam": ["khadija u imam", "khadija usman imam"],
  "zainab usman imam": ["zainab u imam", "zainab usman imam"],
  "baraka amrullah": ["barata amrullah", "baraka amrullah"],
  "maryam faysal ameen": ["maryam faysal amin", "maryam faysal ameen"],
  "david oloruntoba": ["david oloruntola", "david oloruntoba"],
  "mana saad": ["nana saad", "mana saad", "nana sa'ad"],
  "ibrahim sani shehu": ["ramadan sani shehu", "ibrahim sani shehu"],
  "noor aliyu maina": ["noor aliyu maina"],
};

async function main() {
  const dataPath = path.resolve('student-admission-data.json');
  const corrections = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: classes } = await client.query(`SELECT id, name FROM "Class" ORDER BY id`);
    const { rows: students } = await client.query(`
      SELECT s.id, s."admissionNo", s."firstName", s."middleName", s."lastName", s.sex::text AS sex,
             e.id AS enrollment_id, e."classId", e."sessionId", c.name AS class_name
      FROM "Student" s
      LEFT JOIN "Enrollment" e ON e."studentId" = s.id AND e.status = 'ACTIVE'
      LEFT JOIN "Class" c ON c.id = e."classId"
    `);

    const usedStudentIds = new Set();
    const results = [];

    for (const row of corrections) {
      const admissionNo = regToAdmission(row.reg);
      const classId = resolveClassId(classes, row.classKey);
      if (!classId) {
        results.push({ sn: row.sn, name: row.name, status: 'ERROR', detail: `class not found: ${row.classKey}` });
        continue;
      }

      // Match student
      let best = null;
      let bestScore = 0;

      // Prefer match by existing admission digits
      const regDigits = String(row.reg).replace(/[^0-9]/g, '');
      for (const s of students) {
        if (usedStudentIds.has(s.id)) continue;
        const admDigits = String(s.admissionNo || '').replace(/[^0-9]/g, '');
        if (admDigits === regDigits || admDigits.endsWith(regDigits) || regDigits.endsWith(admDigits.replace(/^2026/, ''))) {
          // digit match is strong but verify name somewhat
          const sc = Math.max(scoreMatch(row.name, s), 0.5);
          if (sc > bestScore) {
            best = s;
            bestScore = Math.max(sc, 0.85);
          }
        }
      }

      if (!best || bestScore < 0.7) {
        for (const s of students) {
          if (usedStudentIds.has(s.id)) continue;
          let sc = scoreMatch(row.name, s);
          const aliasList = aliases[norm(row.name)] || [];
          for (const a of aliasList) {
            sc = Math.max(sc, scoreMatch(a, s));
          }
          if (sc > bestScore) {
            best = s;
            bestScore = sc;
          }
        }
      }

      if (!best || bestScore < 0.55) {
        results.push({ sn: row.sn, name: row.name, status: 'NOT_FOUND', detail: `bestScore=${bestScore.toFixed(2)}` });
        continue;
      }

      usedStudentIds.add(best.id);
      const nameParts = splitName(row.name);
      const sex = row.sex === 'M' ? 'MALE' : 'FEMALE';

      // Temporary admission to avoid unique conflicts during swaps
      const tempAdmission = `TMP-${row.sn}-${Date.now().toString(36)}`;

      await client.query(
        `UPDATE "Student"
         SET "admissionNo" = $1,
             "firstName" = $2,
             "middleName" = $3,
             "lastName" = $4,
             sex = $5::"Sex",
             "updatedAt" = NOW()
         WHERE id = $6`,
        [tempAdmission, nameParts.firstName, nameParts.middleName, nameParts.lastName, sex, best.id]
      );

      // Store final admission after loop; keep mapping
      results.push({
        sn: row.sn,
        name: row.name,
        status: 'MATCHED',
        studentId: best.id,
        oldAdmission: best.admissionNo,
        newAdmission: admissionNo,
        oldClass: best.class_name,
        newClassId: classId,
        newClassKey: row.classKey,
        enrollmentId: best.enrollment_id,
        sessionId: best.sessionId,
        score: bestScore,
        nameParts,
        sex,
      });
    }

    // Apply final unique admission numbers
    for (const r of results.filter((x) => x.status === 'MATCHED')) {
      await client.query(
        `UPDATE "Student" SET "admissionNo" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [r.newAdmission, r.studentId]
      );

      if (r.enrollmentId && r.sessionId) {
        await client.query(
          `UPDATE "Enrollment" SET "classId" = $1 WHERE id = $2`,
          [r.newClassId, r.enrollmentId]
        );
      } else if (r.sessionId) {
        await client.query(
          `INSERT INTO "Enrollment" (id, "studentId", "sessionId", "classId", status, "enrolledAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, 'ACTIVE', NOW())
           ON CONFLICT ("studentId", "sessionId") DO UPDATE SET "classId" = EXCLUDED."classId", status = 'ACTIVE'`,
          [r.studentId, r.sessionId, r.newClassId]
        );
      } else {
        // ensure active session
        const sess = await client.query(`SELECT id FROM "Session" WHERE "isActive" = true ORDER BY id DESC LIMIT 1`);
        const sessionId = sess.rows[0]?.id;
        if (sessionId) {
          await client.query(
            `INSERT INTO "Enrollment" (id, "studentId", "sessionId", "classId", status, "enrolledAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, 'ACTIVE', NOW())
             ON CONFLICT ("studentId", "sessionId") DO UPDATE SET "classId" = EXCLUDED."classId", status = 'ACTIVE'`,
            [r.studentId, sessionId, r.newClassId]
          );
        }
      }
    }

    await client.query('COMMIT');

    console.log('=== UPDATES ===');
    for (const r of results.filter((x) => x.status === 'MATCHED')) {
      console.log(
        `#${r.sn} ${r.name}: ${r.oldAdmission} -> ${r.newAdmission} | ${r.oldClass || '?'} -> ${r.newClassKey} (score ${r.score.toFixed(2)})`
      );
    }

    const notFound = results.filter((x) => x.status !== 'MATCHED');
    if (notFound.length) {
      console.log('\n=== NOT UPDATED ===');
      for (const r of notFound) console.log(`#${r.sn} ${r.name}: ${r.status} ${r.detail || ''}`);
    }

    const unmatchedDb = students.filter((s) => !usedStudentIds.has(s.id));
    console.log('\n=== DB STUDENTS NOT IN OFFICIAL LIST ===');
    for (const s of unmatchedDb) {
      console.log(
        `${s.admissionNo} | ${[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')} | ${s.class_name || 'no class'}`
      );
    }

    console.log(`\nSummary: matched=${results.filter((r) => r.status === 'MATCHED').length} failed=${notFound.length} leftover_db=${unmatchedDb.length}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
