const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addTestStudents() {
  try {
    if (process.env.ALLOW_TEST_DATA !== 'true') {
      console.log('Set ALLOW_TEST_DATA=true to run this script.');
      return;
    }

    // Add test students to YEAR 1 (Class ID: 5) for 2025/2026 (Session ID: 2)
    const testStudents = [
      {
        admissionNo: 'YEAR1001',
        firstName: 'Alice',
        lastName: 'Johnson',
        classId: 5,
        sessionId: 2
      },
      {
        admissionNo: 'YEAR1002', 
        firstName: 'Bob',
        lastName: 'Smith',
        classId: 5,
        sessionId: 2
      },
      {
        admissionNo: 'YEAR1003',
        firstName: 'Charlie',
        lastName: 'Brown',
        classId: 5,
        sessionId: 2
      }
    ];

    for (const student of testStudents) {
      await prisma.student.create({
        data: student
      });
      console.log(`Created student: ${student.admissionNo}`);
    }

    console.log('Test students added successfully!');
  } catch (error) {
    console.error('Error adding students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestStudents();
