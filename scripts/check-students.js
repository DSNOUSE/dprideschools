const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkStudents() {
  try {
    const count = await prisma.student.count();
    console.log('Total students in database:', count);

    if (count > 0) {
      console.log('\nRecent students (last 10):');
      const students = await prisma.student.findMany({
        take: 10,
        include: { class: true, session: true },
        orderBy: { createdAt: 'desc' }
      });

      students.forEach(s => {
        console.log(`  ${s.admissionNo} - ${s.firstName} ${s.lastName} (${s.class.name}, ${s.session.name})`);
      });

      console.log('\nSample by class:');
      const classes = await prisma.class.findMany({ take: 3 });
      for (const cls of classes) {
        const classCount = await prisma.student.count({ where: { classId: cls.id } });
        console.log(`  ${cls.name}: ${classCount} students`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
