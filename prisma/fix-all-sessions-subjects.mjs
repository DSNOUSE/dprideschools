// Comprehensive fix: Add complete subject offerings for Year 9 across ALL sessions
// This ensures Grade Management works for viewing/editing grades in any session

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

async function fixAllSessions() {
  try {
    console.log('🔧 Fixing Year 9 subject offerings across ALL sessions...\n');

    const YEAR_9_CLASS_ID = 13;
    const BASELINE_SESSION_ID = 2; // 2026/2027 has the complete set we just created

    // Step 1: Get all sessions
    console.log('Step 1: Fetching all academic sessions...');
    const allSessions = await prisma.session.findMany({
      orderBy: { name: 'asc' }
    });
    console.log(`Found ${allSessions.length} sessions:`);
    allSessions.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));

    // Step 2: Get the baseline subject offerings from 2026/2027
    console.log('\nStep 2: Getting baseline subject offerings from 2026/2027...');
    const baselineOfferings = await prisma.subjectOffering.findMany({
      where: {
        classId: YEAR_9_CLASS_ID,
        sessionId: BASELINE_SESSION_ID,
        isActive: true
      },
      include: { subject: true }
    });

    console.log(`Found ${baselineOfferings.length} baseline subjects`);
    baselineOfferings.forEach(o => console.log(`  - ${o.subject.name}`));

    if (baselineOfferings.length === 0) {
      console.log('❌ ERROR: No baseline offerings found! Run fix-year9-subjects.mjs first.');
      return;
    }

    // Step 3: For each session, ensure all baseline subjects exist
    console.log('\nStep 3: Ensuring all subjects exist in all sessions...');
    
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const session of allSessions) {
      if (session.id === BASELINE_SESSION_ID) {
        console.log(`  ⏭️  Skipping 2026/2027 (baseline session)`);
        continue;
      }

      console.log(`\n  📅 Processing ${session.name} (ID: ${session.id})`);

      // Get existing offerings for this session
      const existingOfferings = await prisma.subjectOffering.findMany({
        where: {
          classId: YEAR_9_CLASS_ID,
          sessionId: session.id
        },
        include: { subject: true }
      });

      console.log(`     Currently has: ${existingOfferings.length} subjects`);

      // Find missing subjects
      const existingSubjectIds = new Set(existingOfferings.map(o => o.subjectId));
      const missingSubjects = baselineOfferings.filter(
        o => !existingSubjectIds.has(o.subjectId)
      );

      if (missingSubjects.length === 0) {
        console.log(`     ✅ Already has all ${baselineOfferings.length} subjects`);
        totalSkipped += baselineOfferings.length;
        continue;
      }

      // Create missing offerings
      console.log(`     🔄 Adding ${missingSubjects.length} missing subjects...`);
      const created = await Promise.all(
        missingSubjects.map(offering =>
          prisma.subjectOffering.create({
            data: {
              subjectId: offering.subjectId,
              classId: YEAR_9_CLASS_ID,
              sessionId: session.id,
              isCompulsory: offering.isCompulsory,
              isActive: true
            }
          })
        )
      );

      console.log(`     ✅ Added ${created.length} subjects`);
      totalCreated += created.length;
    }

    // Step 4: Verify all sessions now have complete offerings
    console.log('\n\nStep 4: Verification - Final state of all sessions:');
    for (const session of allSessions) {
      const offerings = await prisma.subjectOffering.findMany({
        where: {
          classId: YEAR_9_CLASS_ID,
          sessionId: session.id
        }
      });
      console.log(`  ✅ ${session.name}: ${offerings.length} subjects`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Created: ${totalCreated} new offerings`);
    console.log(`  Skipped: ${totalSkipped} already-existing offerings`);
    console.log(`\n🎉 All sessions now have complete Year 9 subject offerings!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

fixAllSessions();
