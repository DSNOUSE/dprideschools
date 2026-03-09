// Simple parent/student account creation for Vercel deployment
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createSampleAccounts() {
  console.log('👨‍👩‍👧‍👦 Creating sample parent and student accounts...');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Create roles
    const parentRole = await prisma.role.upsert({
      where: { name: 'parent' },
      update: {},
      create: { name: 'parent', description: 'Parent account' }
    });

    const studentRole = await prisma.role.upsert({
      where: { name: 'student' },
      update: {},
      create: { name: 'student', description: 'Student account' }
    });

    console.log('✅ Roles ready');

    // Create sample parent
    const parentPassword = await argon2.hash('Parent123!');
    const parent = await prisma.user.upsert({
      where: { email: 'parent@dprideschools.com' },
      update: { passwordHash: parentPassword },
      create: {
        email: 'parent@dprideschools.com',
        passwordHash: parentPassword,
        name: 'Sample Parent',
      }
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: parent.id, roleId: parentRole.id } },
      update: {},
      create: { userId: parent.id, roleId: parentRole.id }
    });

    // Create sample student
    const studentPassword = await argon2.hash('Student123!');
    const student = await prisma.user.upsert({
      where: { email: 'student@dprideschools.com' },
      update: { 
        passwordHash: studentPassword,
        admissionNo: 'DPS2024001'
      },
      create: {
        email: 'student@dprideschools.com',
        passwordHash: studentPassword,
        name: 'Sample Student',
        admissionNo: 'DPS2024001'
      }
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: student.id, roleId: studentRole.id } },
      update: {},
      create: { userId: student.id, roleId: studentRole.id }
    });

    console.log('🎉 Sample accounts created!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('\n👨‍👩‍👧‍👦 PARENT:');
    console.log('  URL: http://localhost:3000/signin');
    console.log('  Email: parent@dprideschools.com');
    console.log('  Password: Parent123!');
    
    console.log('\n🎓 STUDENT:');
    console.log('  URL: http://localhost:3000/signin');
    console.log('  Email: student@dprideschools.com');
    console.log('  Password: Student123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAccounts();
