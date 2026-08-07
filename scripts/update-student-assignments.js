// Update student assignments and subject configurations
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
    console.log('🔄 Updating student assignments and subjects...\n');

    // 1. Move Mukhtar Salihu to Preparatory (Nursery 2)
    console.log('1️⃣  Moving Mukhtar Salihu to Preparatory class...');
    
    const preparatoryClass = await prisma.class.findFirst({
      where: {
        name: 'PREPARATORY (Nursery 2)',
        department: {
          name: 'Early Years'
        }
      }
    });

    if (!preparatoryClass) {
      console.log('   ❌ Preparatory class not found');
    } else {
      const mukhtar = await prisma.student.findFirst({
        where: {
          firstName: 'Mukhtar'
        }
      });

      if (mukhtar) {
        await prisma.student.update({
          where: { id: mukhtar.id },
          data: { classId: preparatoryClass.id }
        });
        console.log(`   ✅ Moved Mukhtar Salihu to PREPARATORY (Nursery 2)\n`);
      } else {
        console.log('   ❌ Mukhtar not found\n');
      }
    }

    // 2. Add Arabic Language subject to Early Years department
    console.log('2️⃣  Adding Arabic Language to Early Years department...');
    
    const earlyYearsDept = await prisma.department.findFirst({
      where: { name: 'Early Years' }
    });

    if (!earlyYearsDept) {
      console.log('   ❌ Early Years department not found\n');
    } else {
      const arabicSubject = await prisma.subject.upsert({
        where: {
          name_departmentId: {
            name: 'Arabic Language',
            departmentId: earlyYearsDept.id
          }
        },
        update: {
          section: 'Nursery'
        },
        create: {
          name: 'Arabic Language',
          departmentId: earlyYearsDept.id,
          section: 'Nursery',
          maxScore: 100
        }
      });
      console.log(`   ✅ Arabic Language added to Early Years (${arabicSubject.section})\n`);
    }

    // 3. Add Hafsat Bint Abubakar to Year 1
    console.log('3️⃣  Adding Hafsat Bint Abubakar to Year 1...');
    
    const year1Class = await prisma.class.findFirst({
      where: {
        name: 'YEAR 1',
        department: {
          name: 'Primary'
        }
      }
    });

    if (!year1Class) {
      console.log('   ❌ Year 1 class not found\n');
    } else {
      // Check if Hafsat Bint Abubakar already exists
      const existingHafsat = await prisma.student.findFirst({
        where: {
          firstName: 'Hafsat',
          lastName: 'Bint Abubakar'
        }
      });

      if (existingHafsat) {
        await prisma.student.update({
          where: { id: existingHafsat.id },
          data: { classId: year1Class.id }
        });
        console.log(`   ✅ Updated Hafsat Bint Abubakar to YEAR 1\n`);
      } else {
        // Create new student
        const currentYear = new Date().getFullYear();
        const admissionNo = `DPS${currentYear}${String(Date.now()).slice(-3)}`;
        
        const newStudent = await prisma.student.create({
          data: {
            admissionNo,
            firstName: 'Hafsat',
            lastName: 'Bint Abubakar',
            sex: 'Female',
            classId: year1Class.id,
            sessionId: (await prisma.session.findFirst({ where: { isActive: true } }))?.id
          }
        });
        console.log(`   ✅ Created Hafsat Bint Abubakar in YEAR 1 (Admission: ${admissionNo})\n`);
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('🎉 UPDATES COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log('✅ Mukhtar Salihu → PREPARATORY (Nursery 2)');
    console.log('✅ Arabic Language → Early Years (Nursery)');
    console.log('✅ Hafsat Bint Abubakar → YEAR 1');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();