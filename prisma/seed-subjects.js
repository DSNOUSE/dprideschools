// Seeder: upserts subjects grouped by section/department
// Usage: node prisma/seed-subjects.js

const fs = require('fs');
const path = require('path');
// auto-load .env
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

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(2);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Provided subject list
  const subjectsBySection = [
    {
      section: 'Nursery',
      subjects: [
        'Letters',
        'Moral Instructions',
        'Elementary Science',
        'Numbers',
        'Picture Reading & Rhymes',
        'Phonics & Spellings',
        'Arabic Language'
      ]
    },
    {
      section: 'Primary',
      subjects: [
        'Mathematics',
        'Cultural and Creative Art (CCA)',
        'Vocabulary/Spellings',
        'RVE',
        'English',
        'History',
        'Pre-Vocational Studies (PVS)',
        'Basic and Science Technology (BST)',
        'IRK',
        'Arabic'
      ]
    },
    {
      section: 'Secondary',
      subjects: [
        'Mathematics',
        'Cultural and Creative Art (CCA)',
        'Business Studies',
        'Vocabulary/Spellings',
        'National Value (NVE)',
        'Hausa',
        'French',
        'Literature',
        'English',
        'History',
        'Pre-Vocational Studies (PVS)',
        'Basic and Science Technology (BST)',
        'IRK',
        'ORAL'
      ]
    }
  ];

  const sectionToDept = {
    Nursery: 'Early Years',
    Primary: 'Primary',
    Secondary: 'Secondary'
  };

  try {
    let total = 0;
    for (const group of subjectsBySection) {
      const deptName = sectionToDept[group.section] || group.section;
      const dept = await prisma.department.upsert({
        where: { name: deptName },
        update: {},
        create: { name: deptName }
      });

      for (const subjName of group.subjects) {
        await prisma.subject.upsert({
          where: { name_departmentId: { name: subjName, departmentId: dept.id } },
          update: { section: group.section },
          create: { name: subjName, departmentId: dept.id, section: group.section, maxScore: 100 }
        });
        console.log(`  ✓ ${subjName} -> ${deptName} (${group.section})`);
        total++;
      }
    }

    console.log(`\n🎉 Subjects seeded: ${total}`);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
