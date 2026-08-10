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

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Missing students from our list
const missingStudents = [
  'Ali Mohammed BMM',
  'Nabage Rugayya Nazir',
  'Khadija Usman Imam',
  'Zainab Usman Imam',
  'Maryam Faysal Ameen'
];

async function main() {
  console.log('=== SEARCHING FOR MISSING STUDENTS ===\n');
  
  for (const name of missingStudents) {
    console.log(`\nSearching for: ${name}`);
    
    // Search by first name
    const firstName = name.split(' ')[0];
    const matches = await prisma.student.findMany({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' }
      },
      include: { class: true }
    });
    
    if (matches.length === 0) {
      console.log('  ❌ No matches found by first name');
    } else {
      console.log(`  Found ${matches.length} potential match(es):`);
      matches.forEach(s => {
        const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`;
        console.log(`    - ${fullName} | Class: ${s.class.name} | Reg: ${s.admissionNo}`);
      });
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});