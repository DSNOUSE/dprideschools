require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchStudent() {
  try {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Hanifa', mode: 'insensitive' } },
          { lastName: { contains: 'Hanifa', mode: 'insensitive' } },
          { middleName: { contains: 'Hanifa', mode: 'insensitive' } },
          { firstName: { contains: 'Jibril', mode: 'insensitive' } },
          { lastName: { contains: 'Jibril', mode: 'insensitive' } },
          { middleName: { contains: 'Jibril', mode: 'insensitive' } },
          { firstName: { contains: 'Usman', mode: 'insensitive' } },
          { lastName: { contains: 'Usman', mode: 'insensitive' } },
          { middleName: { contains: 'Usman', mode: 'insensitive' } },
        ]
      }
    });

    console.log('Found students:', students.length);
    console.log(JSON.stringify(students, null, 2));

    if (students.length === 0) {
      console.log('\nNo students found with name containing Hanifa, Jibril, or Usman');
      console.log('\nSearching for all students to see what we have...');
      const allStudents = await prisma.student.findMany({ take: 20 });
      console.log('First 20 students in database:');
      console.log(JSON.stringify(allStudents, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchStudent();
