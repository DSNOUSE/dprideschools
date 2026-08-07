// Verify the updates were applied correctly
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
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

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(2);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🔍 Verifying updates...\n');

    // 1. Verify Mukhtar Salihu
    console.log('1️⃣  Mukhtar Salihu:');
    const mukhtar = await prisma.student.findFirst({
      where: { firstName: 'Mukhtar' },
      include: { class: { include: { department: true } } }
    });
    if (mukhtar) {
      console.log(`   ✅ ${mukhtar.firstName} ${mukhtar.lastName}`);
      console.log(`   📚 Class: ${mukhtar.class?.name}`);
      console.log(`   🏢 Department: ${mukhtar.class?.department?.name}`);
      console.log(mukhtar.class?.name === 'PREPARATORY (Nursery 2)' ? '   ✅ CORRECT\n' : '   ❌ WRONG\n');
    } else {
      console.log('   ❌ Not found\n');
    }

    // 2. Verify Arabic Language subjects
    console.log('2️⃣  Arabic Language subjects:');
    const arabicSubjects = await prisma.subject.findMany({
      where: { name: 'Arabic Language' },
      include: { department: true }
    });
    console.log(`   📊 Found ${arabicSubjects.length} Arabic Language subject(s):`);
    for (const subj of arabicSubjects) {
      console.log(`   - ID: ${subj.id}, Dept: ${subj.department?.name}, Section: ${subj.section || 'None'}`);
    }
    const earlyYearsArabic = arabicSubjects.find(s => s.department?.name === 'Early Years');
    console.log(earlyYearsArabic ? '   ✅ Arabic in Early Years\n' : '   ❌ Arabic NOT in Early Years\n');

    // 3. Verify Hafsat Bint Abubakar
    console.log('3️⃣  Hafsat Bint Abubakar:');
    const hafsat = await prisma.student.findFirst({
      where: { 
        firstName: 'Hafsat', 
        lastName: 'Bint Abubakar' 
      },
      include: { class: { include: { department: true } } }
    });
    if (hafsat) {
      console.log(`   ✅ ${hafsat.firstName} ${hafsat.lastName}`);
      console.log(`   📚 Class: ${hafsat.class?.name}`);
      console.log(`   🏢 Department: ${hafsat.class?.department?.name}`);
      console.log(hafsat.class?.name === 'YEAR 1' ? '   ✅ CORRECT\n' : '   ❌ WRONG\n');
    } else {
      console.log('   ❌ Not found\n');
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📋 VERIFICATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Mukhtar Salihu: ${mukhtar?.class?.name === 'PREPARATORY (Nursery 2)' ? '✅' : '❌'}`);
    console.log(`Arabic in Early Years: ${earlyYearsArabic ? '✅' : '❌'}`);
    console.log(`Hafsat Bint Abubakar in Year 1: ${hafsat?.class?.name === 'YEAR 1' ? '✅' : '❌'}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();