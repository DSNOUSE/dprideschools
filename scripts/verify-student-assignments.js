// Verify student assignments and subject configurations
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
    console.log('🔍 Verifying student assignments and subjects...\n');

    // 1. Check Mukhtar Salihu
    console.log('1️⃣  Checking Mukhtar Salihu...');
    const mukhtar = await prisma.student.findFirst({
      where: {
        firstName: 'Mukhtar'
      },
      include: {
        class: {
          include: {
            department: true
          }
        }
      }
    });

    if (mukhtar) {
      console.log(`   ✅ Found: ${mukhtar.firstName} ${mukhtar.lastName}`);
      console.log(`   📚 Class: ${mukhtar.class?.name || 'None'}`);
      console.log(`   🏢 Department: ${mukhtar.class?.department?.name || 'None'}`);
      
      if (mukhtar.class?.name === 'PREPARATORY (Nursery 2)') {
        console.log('   ✅ CORRECT: Mukhtar is in Preparatory class\n');
      } else {
        console.log(`   ⚠️  ACTUAL: Mukhtar is in ${mukhtar.class?.name}, not Preparatory\n`);
      }
    } else {
      console.log('   ❌ Mukhtar Salihu not found in database\n');
    }

    // 2. Check Arabic subject in Nursery classes
    console.log('2️⃣  Checking Arabic subject assignments...');
    const arabicSubject = await prisma.subject.findFirst({
      where: {
        name: 'Arabic Language'
      },
      include: {
        department: true
      }
    });

    if (arabicSubject) {
      console.log(`   ✅ Found Arabic subject:`);
      console.log(`   📚 Name: ${arabicSubject.name}`);
      console.log(`   🏢 Department: ${arabicSubject.department?.name || 'None'}`);
      console.log(`   📝 Section: ${arabicSubject.section || 'None'}\n`);
    } else {
      console.log('   ❌ Arabic Language subject not found\n');
    }

    // 3. Check Hafsat Abubakar
    console.log('3️⃣  Checking Hafsat Bint Abubakar...');
    const hafsat = await prisma.student.findFirst({
      where: {
        firstName: 'Hafsat'
      },
      include: {
        class: {
          include: {
            department: true
          }
        }
      }
    });

    if (hafsat) {
      console.log(`   ✅ Found: ${hafsat.firstName} ${hafsat.lastName}`);
      console.log(`   📚 Class: ${hafsat.class?.name || 'None'}`);
      console.log(`   🏢 Department: ${hafsat.class?.department?.name || 'None'}`);
      
      if (hafsat.class?.name === 'YEAR 1') {
        console.log('   ✅ CORRECT: Hafsat is in Year 1\n');
      } else {
        console.log(`   ⚠️  ACTUAL: Hafsat is in ${hafsat.class?.name}, not Year 1\n`);
      }
    } else {
      console.log('   ❌ Hafsat not found in database\n');
    }

    // Show all students in Nursery/Primary classes
    console.log('4️⃣  All students in Early Years and Primary classes:');
    const earlyYearsClasses = await prisma.class.findMany({
      where: {
        department: {
          name: 'Early Years'
        }
      },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    for (const cls of earlyYearsClasses) {
      const students = cls.students.map(s => `${s.student.firstName} ${s.student.lastName}`).join(', ');
      if (students) {
        console.log(`   📚 ${cls.name}: ${students}`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();