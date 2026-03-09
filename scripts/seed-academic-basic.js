// Quick academic data seed for testing grades system
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAcademicData() {
  console.log('🎓 Seeding basic academic data...');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Create basic classes
    const classes = [
      { name: 'Nursery 1', sort_order: 1 },
      { name: 'Nursery 2', sort_order: 2 },
      { name: 'Primary 1', sort_order: 3 },
      { name: 'Primary 2', sort_order: 4 },
      { name: 'Primary 3', sort_order: 5 },
      { name: 'JSS 1', sort_order: 6 },
      { name: 'JSS 2', sort_order: 7 },
      { name: 'JSS 3', sort_order: 8 },
    ];

    for (const cls of classes) {
      await prisma.class.upsert({
        where: { name: cls.name },
        update: {},
        create: cls
      });
    }
    console.log('✅ Classes created');

    // Create current academic session
    const currentYear = new Date().getFullYear();
    const sessionName = `${currentYear}/${currentYear + 1}`;
    
    await prisma.session.upsert({
      where: { name: sessionName },
      update: {},
      create: { name: sessionName, isActive: true }
    });
    console.log('✅ Session created');

    // Create terms
    const terms = [
      { name: 'First Term', sort_order: 1 },
      { name: 'Second Term', sort_order: 2 },
      { name: 'Third Term', sort_order: 3 }
    ];

    for (const term of terms) {
      await prisma.term.upsert({
        where: { name: term.name },
        update: {},
        create: term
      });
    }
    console.log('✅ Terms created');

    // Create departments
    const departments = [
      { name: 'Early Years' },
      { name: 'Primary' },
      { name: 'Secondary' }
    ];

    for (const dept of departments) {
      await prisma.department.upsert({
        where: { name: dept.name },
        update: {},
        create: dept
      });
    }
    console.log('✅ Departments created');

    // Create basic subjects
    const subjects = [
      { name: 'English Language', maxScore: 100, departmentId: 2 },
      { name: 'Mathematics', maxScore: 100, departmentId: 2 },
      { name: 'Science', maxScore: 100, departmentId: 2 },
      { name: 'Social Studies', maxScore: 100, departmentId: 2 },
      { name: 'Basic Science', maxScore: 100, departmentId: 3 },
      { name: 'Basic Technology', maxScore: 100, departmentId: 3 },
      { name: 'Agricultural Science', maxScore: 100, departmentId: 3 },
      { name: 'Home Economics', maxScore: 100, departmentId: 3 },
    ];

    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: {},
        create: subject
      });
    }
    console.log('✅ Subjects created');

    // Create sample students
    const sampleStudents = [
      { admissionNo: 'DPS2024001', firstName: 'Ahmad', lastName: 'Mohammed', classId: 3, sessionId: 1 },
      { admissionNo: 'DPS2024002', firstName: 'Fatima', lastName: 'Ibrahim', classId: 3, sessionId: 1 },
      { admissionNo: 'DPS2024003', firstName: 'Muhammad', lastName: 'Abubakar', classId: 3, sessionId: 1 },
      { admissionNo: 'DPS2024004', firstName: 'Aisha', lastName: 'Yusuf', classId: 3, sessionId: 1 },
      { admissionNo: 'DPS2024005', firstName: 'Umar', lastName: 'Sani', classId: 3, sessionId: 1 },
    ];

    for (const student of sampleStudents) {
      await prisma.student.upsert({
        where: { admissionNo: student.admissionNo },
        update: {},
        create: student
      });
    }
    console.log('✅ Sample students created');

    console.log('🎉 Academic data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`  - Classes: ${classes.length}`);
    console.log(`  - Sessions: 1`);
    console.log(`  - Terms: ${terms.length}`);
    console.log(`  - Departments: ${departments.length}`);
    console.log(`  - Subjects: ${subjects.length}`);
    console.log(`  - Students: ${sampleStudents.length}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAcademicData()
  .then(() => {
    console.log('✅ Academic seeding completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Academic seeding failed:', e);
    process.exit(1);
  });
