// Academic data seeding script for DPRIDE School
// This script creates sample academic data for testing the results system

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

// Prisma 7 client requires an adapter when using the Node.js driver
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting academic data seeding...');
  const seedSampleData = process.env.SEED_SAMPLE_DATA === 'true';

  // 1. Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Nursery' },
      update: {},
      create: { name: 'Nursery' }
    }),
    prisma.department.upsert({
      where: { name: 'Primary' },
      update: {},
      create: { name: 'Primary' }
    }),
    prisma.department.upsert({
      where: { name: 'Secondary' },
      update: {},
      create: { name: 'Secondary' }
    })
  ]);

  console.log('✓ Departments created');

  // 2. Create Classes
  const classes = await Promise.all([
    // Nursery Classes
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Nursery 1', departmentId: departments[0].id } },
      update: {},
      create: { name: 'Nursery 1', departmentId: departments[0].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Nursery 2', departmentId: departments[0].id } },
      update: {},
      create: { name: 'Nursery 2', departmentId: departments[0].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Nursery 3', departmentId: departments[0].id } },
      update: {},
      create: { name: 'Nursery 3', departmentId: departments[0].id }
    }),
    // Primary Classes
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 1', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 1', departmentId: departments[1].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 2', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 2', departmentId: departments[1].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 3', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 3', departmentId: departments[1].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 4', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 4', departmentId: departments[1].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 5', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 5', departmentId: departments[1].id }
    }),
    prisma.class.upsert({
      where: { name_departmentId: { name: 'Primary 6', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Primary 6', departmentId: departments[1].id }
    })
  ]);

  console.log('✓ Classes created');

  // 3. Create Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'English Language', departmentId: departments[1].id } },
      update: {},
      create: { name: 'English Language', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Mathematics', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Mathematics', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Basic Science', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Basic Science', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Social Studies', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Social Studies', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Computer Studies', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Computer Studies', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Physical Education', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Physical Education', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Creative Arts', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Creative Arts', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Home Economics', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Home Economics', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Agricultural Science', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Agricultural Science', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Civic Education', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Civic Education', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'Christian Religious Studies', departmentId: departments[1].id } },
      update: {},
      create: { name: 'Christian Religious Studies', departmentId: departments[1].id, maxScore: 100 }
    }),
    prisma.subject.upsert({
      where: { name_departmentId: { name: 'French Language', departmentId: departments[1].id } },
      update: {},
      create: { name: 'French Language', departmentId: departments[1].id, maxScore: 100 }
    })
  ]);

  console.log('✓ Subjects created');

  // 4. Create Terms
  const terms = await Promise.all([
    prisma.term.upsert({
      where: { name: 'First Term' },
      update: {},
      create: { name: 'First Term' }
    }),
    prisma.term.upsert({
      where: { name: 'Second Term' },
      update: {},
      create: { name: 'Second Term' }
    }),
    prisma.term.upsert({
      where: { name: 'Third Term' },
      update: {},
      create: { name: 'Third Term' }
    })
  ]);

  console.log('✓ Terms created');

  // 5. Create Sessions
  const sessions = await Promise.all([
    prisma.session.upsert({
      where: { name: '2024/2025' },
      update: { isActive: true },
      create: { name: '2024/2025', isActive: true }
    }),
    prisma.session.upsert({
      where: { name: '2025/2026' },
      update: { isActive: false },
      create: { name: '2025/2026', isActive: false }
    })
  ]);

  console.log('✓ Sessions created');

  // 6. Create Grade Scales
  const gradeScales = await Promise.all([
    prisma.gradeScale.upsert({
      where: { grade: 'A' },
      update: {},
      create: { grade: 'A', minScore: 80, maxScore: 100, description: 'Excellent' }
    }),
    prisma.gradeScale.upsert({
      where: { grade: 'B' },
      update: {},
      create: { grade: 'B', minScore: 70, maxScore: 79.9, description: 'Very Good' }
    }),
    prisma.gradeScale.upsert({
      where: { grade: 'C' },
      update: {},
      create: { grade: 'C', minScore: 60, maxScore: 69.9, description: 'Good' }
    }),
    prisma.gradeScale.upsert({
      where: { grade: 'D' },
      update: {},
      create: { grade: 'D', minScore: 50, maxScore: 59.9, description: 'Fair' }
    }),
    prisma.gradeScale.upsert({
      where: { grade: 'F' },
      update: {},
      create: { grade: 'F', minScore: 0, maxScore: 49.9, description: 'Fail' }
    })
  ]);

  console.log('✓ Grade scales created');

  if (seedSampleData) {
    // 7. Create Sample Students
    const sampleStudents = [
      { admissionNo: 'DPS2024001', firstName: 'Ahmed', lastName: 'Muhammad', sex: 'M' },
      { admissionNo: 'DPS2024002', firstName: 'Fatima', lastName: 'Abubakar', sex: 'F' },
      { admissionNo: 'DPS2024003', firstName: 'Chukwu', lastName: 'Okoro', sex: 'M' },
      { admissionNo: 'DPS2024004', firstName: 'Aisha', lastName: 'Bello', sex: 'F' },
      { admissionNo: 'DPS2024005', firstName: 'David', lastName: 'Johnson', sex: 'M' },
      { admissionNo: 'DPS2024006', firstName: 'Mariam', lastName: 'Yusuf', sex: 'F' },
      { admissionNo: 'DPS2024007', firstName: 'Peter', lastName: 'Eze', sex: 'M' },
      { admissionNo: 'DPS2024008', firstName: 'Zainab', lastName: 'Ibrahim', sex: 'F' },
      { admissionNo: 'DPS2024009', firstName: 'Samuel', lastName: 'Okafor', sex: 'M' },
      { admissionNo: 'DPS2024010', firstName: 'Khadija', lastName: 'Garba', sex: 'F' }
    ];

    const students = [];
    for (const studentData of sampleStudents) {
      const student = await prisma.student.upsert({
        where: { admissionNo: studentData.admissionNo },
        update: {},
        create: {
          ...studentData,
          classId: classes[3].id, // Primary 1
          sessionId: sessions[0].id // 2024/2025
        }
      });
      students.push(student);
    }

    console.log('✓ Sample students created');

    // 8. Create Sample Parents
    const parents = [];
    for (let i = 0; i < 5; i++) {
      const parent = await prisma.parent.upsert({
        where: { email: `parent${i + 1}@dprideschools.com` },
        update: {},
        create: {
          email: `parent${i + 1}@dprideschools.com`,
          name: `Parent ${i + 1}`,
          phone: `0801234567${i}`,
          passwordHash: await argon2.hash('Password123!')
        }
      });
      parents.push(parent);
    }

    console.log('✓ Sample parents created');

    // 9. Link Students to Parents
    for (let i = 0; i < students.length; i++) {
      const parentIndex = i % parents.length;
      await prisma.studentParent.upsert({
        where: {
          studentId_parentId: {
            studentId: students[i].id,
            parentId: parents[parentIndex].id
          }
        },
        update: {},
        create: {
          studentId: students[i].id,
          parentId: parents[parentIndex].id,
          relation: i % 2 === 0 ? 'father' : 'mother'
        }
      });
    }

    console.log('✓ Student-parent relationships created');

    // 10. Create Sample Grades
    for (const student of students) {
      for (const subject of subjects.slice(0, 6)) { // First 6 subjects
        // Generate random scores
        const firstScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const secondScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const fourthScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const average = (firstScore + secondScore + fourthScore) / 3;

        await prisma.grade.upsert({
          where: {
            studentId_subjectId_classId_termId_sessionId: {
              studentId: student.id,
              subjectId: subject.id,
              classId: student.classId,
              termId: terms[0].id, // First Term
              sessionId: student.sessionId
            }
          },
          update: {
            firstScore,
            secondScore,
            fourthScore,
            average
          },
          create: {
            studentId: student.id,
            subjectId: subject.id,
            classId: student.classId,
            termId: terms[0].id, // First Term
            sessionId: student.sessionId,
            firstScore,
            secondScore,
            fourthScore,
            average
          }
        });
      }
    }

    console.log('✓ Sample grades created');

    // 11. Calculate and Create Results
    for (const student of students) {
      const grades = await prisma.grade.findMany({
        where: {
          studentId: student.id,
          classId: student.classId,
          termId: terms[0].id,
          sessionId: student.sessionId
        }
      });

      if (grades.length > 0) {
        const totalScore = grades.reduce((sum, grade) => sum + grade.average, 0);
        const average = totalScore / grades.length;
        const maxScore = grades.length * 100;

        // Calculate position (simplified)
        const position = Math.floor(Math.random() * students.length) + 1;

        await prisma.result.upsert({
          where: {
            studentId_classId_termId_sessionId: {
              studentId: student.id,
              classId: student.classId,
              termId: terms[0].id,
              sessionId: student.sessionId
            }
          },
          update: {
            average,
            totalScore,
            maxScore,
            position
          },
          create: {
            studentId: student.id,
            classId: student.classId,
            termId: terms[0].id,
            sessionId: student.sessionId,
            average,
            totalScore,
            maxScore,
            position
          }
        });
      }
    }

    console.log('✓ Sample results created');
  } else {
    console.log('Skipping sample students, parents, grades, and results');
  }
  console.log('\n🎉 Academic data seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Departments: ${departments.length}`);
  console.log(`- Classes: ${classes.length}`);
  console.log(`- Subjects: ${subjects.length}`);
  console.log(`- Terms: ${terms.length}`);
  console.log(`- Sessions: ${sessions.length}`);
  console.log(`- Students: ${students.length}`);
  console.log(`- Parents: ${parents.length}`);
  console.log(`- Grade Scales: ${gradeScales.length}`);
  console.log('\n🔐 Login Credentials:');
  console.log('Parent accounts: parent1@example.com through parent5@example.com');
  console.log('Password: Password123!');
  console.log('\n👤 Student Login:');
  console.log('Use admission numbers (DPS2024001 - DPS2024010) as both username and password');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
