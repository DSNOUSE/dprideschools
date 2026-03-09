// Simple Neon database seed script
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

// Direct Prisma client connection (no custom adapter)
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon database seeding...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminEmail = 'admin@dprideschools.com';
    const adminPassword = 'ILoveCatsToo123#';
    
    const passwordHash = await argon2.hash(adminPassword);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: passwordHash,
          roles: ['Administrator'],
          admissionNo: 'ADMIN001'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample academic data
    console.log('📚 Creating academic data...');
    
    // Create session
    const session = await prisma.session.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: '2025/2026',
        academicYear: '2025/2026',
        isActive: true
      }
    });
    
    // Create classes
    const classes = [
      { name: 'YEAR 1', sortOrder: 1 },
      { name: 'YEAR 2', sortOrder: 2 },
      { name: 'YEAR 3', sortOrder: 3 }
    ];
    
    for (const classData of classes) {
      await prisma.class.upsert({
        where: { name: classData.name },
        update: {},
        create: classData
      });
    }
    
    // Create term
    await prisma.term.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'First Term',
        sessionId: 1
      }
    });
    
    // Create subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English', code: 'ENG' },
      { name: 'Science', code: 'SCI' }
    ];
    
    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { code: subject.code },
        update: {},
        create: subject
      });
    }
    
    console.log('✅ Academic data created');
    
    // Create sample students
    console.log('👥 Creating sample students...');
    
    const students = [
      { admissionNo: 'DPS2024001', fullName: 'John Smith', gender: 'Male', className: 'YEAR 1' },
      { admissionNo: 'DPS2024002', fullName: 'Jane Doe', gender: 'Female', className: 'YEAR 1' },
      { admissionNo: 'DPS2024003', fullName: 'Mike Johnson', gender: 'Male', className: 'YEAR 2' }
    ];
    
    for (const studentData of students) {
      await prisma.student.upsert({
        where: { admissionNo: studentData.admissionNo },
        update: {},
        create: {
          ...studentData,
          classId: 1, // YEAR 1
          sessionId: 1
        }
      });
    }
    
    console.log('✅ Sample students created');
    
    // Create parent and student user accounts
    console.log('👨‍👩‍👧‍👦 Creating user accounts...');
    
    // Parent account
    const parentEmail = 'parent@dprideschools.com';
    const parentPassword = 'Parent123!';
    const parentHash = await argon2.hash(parentPassword);
    
    const existingParent = await prisma.user.findUnique({
      where: { email: parentEmail }
    });
    
    if (!existingParent) {
      await prisma.user.create({
        data: {
          email: parentEmail,
          password: parentHash,
          roles: ['Parent'],
          admissionNo: 'PARENT001'
        }
      });
      console.log('✅ Parent account created');
    } else {
      console.log('✅ Parent account already exists');
    }
    
    // Student account
    const studentEmail = 'student@dprideschools.com';
    const studentPassword = 'Student123!';
    const studentHash = await argon2.hash(studentPassword);
    
    const existingStudent = await prisma.user.findUnique({
      where: { email: studentEmail }
    });
    
    if (!existingStudent) {
      await prisma.user.create({
        data: {
          email: studentEmail,
          password: studentHash,
          roles: ['Student'],
          admissionNo: 'DPS2024001'
        }
      });
      console.log('✅ Student account created');
    } else {
      console.log('✅ Student account already exists');
    }
    
    console.log('🎉 Neon database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
