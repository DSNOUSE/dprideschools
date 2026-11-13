// Direct database fix script
// This script adds missing subject offerings for Year 9 in session 2 (2026/2027)
// to match Year 8's configuration

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixYear9Subjects() {
  try {
    console.log('🔧 Fixing Year 9 subject offerings...\n');

    // Constants
    const YEAR_9_CLASS_ID = 13;
    const YEAR_8_CLASS_ID = 12;
    const SESSION_ID = 2; // 2026/2027

    // Step 1: Get Year 8's active offerings
    console.log('Step 1: Fetching Year 8 active subject offerings...');
    const year8Offerings = await prisma.subjectOffering.findMany({
      where: {
        classId: YEAR_8_CLASS_ID,
        sessionId: SESSION_ID,
        isActive: true
      },
      include: { subject: true }
    });

    console.log(`Found ${year8Offerings.length} active subjects for Year 8\n`);

    // Step 2: Get Year 9's current offerings
    console.log('Step 2: Fetching Year 9 current offerings...');
    const year9Offerings = await prisma.subjectOffering.findMany({
      where: {
        classId: YEAR_9_CLASS_ID,
        sessionId: SESSION_ID
      },
      include: { subject: true }
    });

    console.log(`Found ${year9Offerings.length} current subjects for Year 9`);
    if (year9Offerings.length > 0) {
      year9Offerings.forEach(o => console.log(`  - ${o.subject.name}`));
    }

    // Step 3: Identify missing subjects
    console.log('\nStep 3: Identifying missing subjects...');
    const year9SubjectIds = new Set(year9Offerings.map(o => o.subjectId));
    const missingSubjects = year8Offerings.filter(o => !year9SubjectIds.has(o.subjectId));

    console.log(`Found ${missingSubjects.length} missing subjects for Year 9\n`);

    if (missingSubjects.length === 0) {
      console.log('✅ Year 9 already has all required subjects!');
      return;
    }

    // Step 4: Add missing subjects
    console.log('Step 4: Adding missing subjects to Year 9...');
    const created = await Promise.all(
      missingSubjects.map(offering =>
        prisma.subjectOffering.create({
          data: {
            subjectId: offering.subjectId,
            classId: YEAR_9_CLASS_ID,
            sessionId: SESSION_ID,
            isCompulsory: offering.isCompulsory,
            isActive: true
          }
        })
      )
    );

    console.log(`✅ Created ${created.length} new subject offerings:\n`);
    created.forEach(o => console.log(`  + Subject ID ${o.subjectId}`));

    // Step 5: Verify
    console.log('\nStep 5: Verifying Year 9 now has all subjects...');
    const updatedYear9 = await prisma.subjectOffering.findMany({
      where: {
        classId: YEAR_9_CLASS_ID,
        sessionId: SESSION_ID
      },
      include: { subject: true }
    });

    console.log(`\n✅ Year 9 now has ${updatedYear9.length} subjects:`);
    updatedYear9.forEach(o => console.log(`  - ${o.subject.name}`));

    console.log('\n🎉 Fix complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

fixYear9Subjects();
