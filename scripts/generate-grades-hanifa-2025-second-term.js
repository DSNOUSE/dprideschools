import 'dotenv/config';
import { prisma } from '../src/lib/prisma.ts';

// Simple CUID generator
function createCuid() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `c${timestamp}${random}`;
}

async function generateGrades() {
  const admissionNo = 'DPS2026034';
  const sessionId = 1; // 2025/2026
  const termId = 3; // Second Term

  try {
    console.log('=== Generating Grades for Hanifa Jibrin Usman - Second Term (2025/2026) ===\n');

    // Get student
    const student = await prisma.student.findUnique({
      where: { admissionNo }
    });

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log(`✅ Student: ${student.firstName} ${student.lastName}`);
    console.log(`   Class ID: ${student.classId}`);
    console.log(`   Session ID: ${sessionId} (2025/2026)`);
    console.log(`   Term ID: ${termId} (Second Term)\n`);

    // Get existing grades to base new grades on (from First Term 2025/2026)
    const existingGrades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
        sessionId: 1, // 2025/2026
        termId: 2, // First Term
      },
      include: { Subject: true }
    });

    console.log(`Found ${existingGrades.length} existing grade records to base new grades on\n`);

    // Generate new grades with slight variations (simulate progress)
    const newGrades = [];
    for (const existing of existingGrades) {
      const baseAverage = existing.average;
      
      // Vary the average slightly (-3 to +7) to show slight improvement
      const variation = Math.floor(Math.random() * 11) - 3;
      const newAverage = Math.max(45, Math.min(100, baseAverage + variation));
      
      // Distribute scores based on new average
      const firstScore = Math.round(newAverage * 0.2);
      const secondScore = Math.round(newAverage * 0.2);
      const fourthScore = Math.round(newAverage * 0.6);
      const actualAverage = firstScore + secondScore + fourthScore;
      
      newGrades.push({
        id: createCuid(),
        studentId: student.id,
        subjectId: existing.subjectId,
        classId: student.classId,
        sessionId: sessionId,
        termId: termId,
        firstScore,
        secondScore,
        fourthScore,
        average: actualAverage,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  ${existing.Subject.name}:`);
      console.log(`    Old Average: ${baseAverage} → New Average: ${actualAverage}`);
      console.log(`    Scores: 1st=${firstScore}, 2nd=${secondScore}, 4th=${fourthScore}`);
    }

    console.log(`\n=== Creating ${newGrades.length} new grade records ===`);

    // Delete any existing grades for this session/term first
    const existingForSessionTerm = await prisma.grade.findMany({
      where: {
        studentId: student.id,
        sessionId,
        termId,
      }
    });

    if (existingForSessionTerm.length > 0) {
      console.log(`Deleting ${existingForSessionTerm.length} existing records for this session/term...`);
      await prisma.grade.deleteMany({
        where: {
          studentId: student.id,
          sessionId,
          termId,
        }
      });
    }

    // Create new grades
    const created = await prisma.grade.createMany({
      data: newGrades,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${created.count} new grade records\n`);

    // Calculate summary
    const totalAverage = newGrades.reduce((sum, g) => sum + g.average, 0);
    const overallAverage = totalAverage / newGrades.length;

    console.log('=== Summary ===');
    console.log(`Overall Average: ${overallAverage.toFixed(2)}%`);
    console.log(`Performance: ${overallAverage >= 70 ? 'Excellent' : overallAverage >= 60 ? 'Good' : overallAverage >= 50 ? 'Satisfactory' : 'Needs Improvement'}`);

  } catch (error) {
    console.error('Error generating grades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateGrades();
