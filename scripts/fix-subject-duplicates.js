// Fix duplicate subjects in the database
// This script merges duplicate subjects (same name across different departments)
// and updates all references to point to the canonical subject

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
    console.log('🔍 Analyzing subjects for duplicates...\n');

    // Get all subjects with their relationships
    const allSubjects = await prisma.subject.findMany({
      include: {
        department: true,
        class: true,
        grades: true,
        reports: true,
        auditLogs: true,
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Total subjects found: ${allSubjects.length}\n`);

    // Group subjects by name
    const subjectsByName = new Map();
    for (const subject of allSubjects) {
      const name = subject.name.trim().toLowerCase();
      if (!subjectsByName.has(name)) {
        subjectsByName.set(name, []);
      }
      subjectsByName.get(name).push(subject);
    }

    // Find duplicates
    const duplicates = [];
    for (const [name, subjects] of subjectsByName) {
      if (subjects.length > 1) {
        duplicates.push({ name, subjects });
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate subjects found!');
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate subject(s):\n`);
    for (const dup of duplicates) {
      console.log(`  "${dup.name}" appears ${dup.subjects.length} times:`);
      for (const subj of dup.subjects) {
        console.log(`    - ID: ${subj.id}, Dept: ${subj.department?.name || 'None'}, Section: ${subj.section || 'None'}, Class: ${subj.class?.name || 'None'}`);
        console.log(`      Grades: ${subj.grades.length}, Reports: ${subj.reports.length}, Audit logs: ${subj.auditLogs.length}`);
      }
    }

    console.log('\n🔧 Merging duplicates...\n');

    let mergedCount = 0;
    let deletedCount = 0;

    for (const dup of duplicates) {
      // Keep the first subject as canonical (prefer ones with more data)
      const canonical = dup.subjects.reduce((best, current) => {
        const bestScore = (best.grades?.length || 0) + (best.reports?.length || 0);
        const currentScore = (current.grades?.length || 0) + (current.reports?.length || 0);
        return currentScore > bestScore ? current : best;
      });

      console.log(`  Merging "${dup.name}" into canonical ID: ${canonical.id}`);

      for (const duplicate of dup.subjects) {
        if (duplicate.id === canonical.id) continue;

        console.log(`    Moving references from ID ${duplicate.id} to ID ${canonical.id}...`);

        // Update grades
        const gradesUpdated = await prisma.grade.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: canonical.id }
        });
        console.log(`      ✓ Updated ${gradesUpdated.count} grades`);

        // Update reports
        const reportsUpdated = await prisma.report.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: canonical.id }
        });
        console.log(`      ✓ Updated ${reportsUpdated.count} reports`);

        // Update audit logs
        const auditLogsUpdated = await prisma.resultAuditLog.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: canonical.id }
        });
        console.log(`      ✓ Updated ${auditLogsUpdated.count} audit logs`);

        // Delete the duplicate
        await prisma.subject.delete({
          where: { id: duplicate.id }
        });
        console.log(`      ✓ Deleted duplicate ID: ${duplicate.id}`);
        deletedCount++;
      }
      mergedCount++;
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 MERGE COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Merged ${mergedCount} subject group(s)`);
    console.log(`🗑️  Deleted ${deletedCount} duplicate subject(s)`);
    console.log('═══════════════════════════════════════\n');

    // Show final count
    const finalCount = await prisma.subject.count();
    console.log(`📊 Final subject count: ${finalCount}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();