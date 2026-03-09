// Create sample parent and student accounts for testing
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createParentStudentAccounts() {
  console.log('👨‍👩‍👧‍👦 Creating parent and student accounts...');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Create Parent and Student roles if they don't exist
    const parentRole = await prisma.role.upsert({
      where: { name: 'parent' },
      update: {},
      create: { name: 'parent', description: 'Parent account for viewing student results' }
    });

    const studentRole = await prisma.role.upsert({
      where: { name: 'student' },
      update: {},
      create: { name: 'student', description: 'Student account for viewing own results' }
    });

    console.log('✅ Roles created/updated');

    // Create sample parent accounts
    const parents = [
      {
        email: 'parent1@dprideschools.com',
        password: 'Parent123!',
        name: 'Mr. Baba',
        childrenAdmissionNos: ['DPS2024001', 'DPS2024002']
      },
      {
        email: 'parent2@dprideschools.com', 
        password: 'Parent123!',
        name: 'Mrs. Imam',
        childrenAdmissionNos: ['DPS2024003', 'DPS2024004', 'DPS2024005']
      },
      {
        email: 'parent3@dprideschools.com',
        password: 'Parent123!',
        name: 'Mr. Maina',
        childrenAdmissionNos: ['DPS2024006', 'DPS2024007']
      }
    ];

    for (const parentData of parents) {
      const passwordHash = await argon2.hash(parentData.password);
      
      const parent = await prisma.user.upsert({
        where: { email: parentData.email },
        update: { passwordHash },
        create: {
          email: parentData.email,
          passwordHash,
          name: parentData.name,
        }
      });

      // Assign parent role
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: parent.id, roleId: parentRole.id } },
        update: {},
        create: { userId: parent.id, roleId: parentRole.id }
      });

      console.log(`✅ Created parent: ${parentData.email}`);
    }

    // Create sample student accounts
    const students = [
      { admissionNo: 'DPS2024001', password: 'Student123!', name: 'Fatima Muhammad Baba' },
      { admissionNo: 'DPS2024002', password: 'Student123!', name: 'Hafsat Usman Imam' },
      { admissionNo: 'DPS2024003', password: 'Student123!', name: 'Nana Sa\'ad' },
      { admissionNo: 'DPS2024004', password: 'Student123!', name: 'Noor Aliyu Maina' },
      { admissionNo: 'DPS2024005', password: 'Student123!', name: 'Umar Faruk Yahaya' },
      { admissionNo: 'DPS2024006', password: 'Student123!', name: 'Amina Abdulhamid' },
      { admissionNo: 'DPS2024007', password: 'Student123!', name: 'Mukhtar Salihu' },
    ];

    for (const studentData of students) {
      const passwordHash = await argon2.hash(studentData.password);
      
      const student = await prisma.user.upsert({
        where: { email: `student-${studentData.admissionNo}@dprideschools.com` },
        update: { 
          passwordHash,
          admissionNo: studentData.admissionNo
        },
        create: {
          email: `student-${studentData.admissionNo}@dprideschools.com`,
          passwordHash,
          name: studentData.name,
          admissionNo: studentData.admissionNo
        }
      });

      // Assign student role
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: student.id, roleId: studentRole.id } },
        update: {},
        create: { userId: student.id, roleId: studentRole.id }
      });

      console.log(`✅ Created student: ${studentData.admissionNo}`);
    }

    console.log('\n🎉 Parent and Student accounts created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('\n👨‍👩‍👧‍👦 PARENTS (use http://localhost:3000/signin):');
    console.log('Email: parent1@dprideschools.com | Password: Parent123!');
    console.log('Email: parent2@dprideschools.com | Password: Parent123!');
    console.log('Email: parent3@dprideschools.com | Password: Parent123!');
    
    console.log('\n🎓 STUDENTS (use http://localhost:3000/signin):');
    console.log('Email: student-DPS2024001@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024002@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024003@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024004@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024005@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024006@dprideschools.com | Password: Student123!');
    console.log('Email: student-DPS2024007@dprideschools.com | Password: Student123!');

  } catch (error) {
    console.error('❌ Failed to create accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createParentStudentAccounts();
