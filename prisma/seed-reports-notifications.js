// Seed sample report and notification data
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== 'string') {
  console.error('DATABASE_URL is not set or not a string. Set the DATABASE_URL environment variable before running this seed.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Ensure there is at least one department
  let department = await prisma.department.findFirst();
  if (!department) {
    department = await prisma.department.create({ data: { name: 'General' } });
  }

  // Ensure there is at least one class
  let klass = await prisma.class.findFirst();
  if (!klass) {
    klass = await prisma.class.create({ data: { name: 'Primary 1', departmentId: department.id } });
  }

  // Ensure session
  let session = await prisma.session.findFirst();
  if (!session) {
    session = await prisma.session.create({ data: { name: '2025/2026', isActive: true } });
  }

  // Ensure term
  let term = await prisma.term.findFirst();
  if (!term) {
    term = await prisma.term.create({ data: { name: 'Term 1' } });
  }

  // Ensure a student
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        admissionNo: 'SAMPLE001',
        firstName: 'Sample',
        lastName: 'Student',
        classId: klass.id,
        sessionId: session.id,
      },
    });
  }

  // Ensure at least one user (use existing admin as teacher if available)
  let teacher = await prisma.user.findFirst();
  if (!teacher) {
    teacher = await prisma.user.create({ data: { email: 'teacher@example.com', name: 'Teacher One', passwordHash: 'seeded' } });
  }

  // Create a sample report for the student
  const report = await prisma.report.create({
    data: {
      studentId: student.id,
      teacherId: teacher.id,
      termId: term.id,
      grade: 'A',
      comment: 'Excellent performance in the sampled term.',
      attendance: 96,
      conduct: 'Good',
      status: 'PUBLISHED',
    },
  });

  // Ensure a parent exists and is linked to the student
  let parent = await prisma.parent.findFirst({ where: { email: 'parent@example.com' } });
  if (!parent) {
    parent = await prisma.parent.create({ data: { email: 'parent@example.com', name: 'Parent One', phone: null, passwordHash: 'seeded' } });
  }

  // Link parent to student if not linked
  const existingLink = await prisma.studentParent.findUnique({ where: { studentId_parentId: { studentId: student.id, parentId: parent.id } } }).catch(() => null);
  if (!existingLink) {
    await prisma.studentParent.create({ data: { studentId: student.id, parentId: parent.id, relation: 'guardian' } });
  }

  // Create a notification and recipient for the parent
  const notification = await prisma.notification.create({
    data: {
      title: 'Sample Notification',
      message: 'This is a seeded announcement for parents regarding the sample report.',
      type: 'ANNOUNCEMENT',
      priority: 'NORMAL',
      recipientType: 'CLASS_PARENTS',
      classId: klass.id,
      senderId: teacher.id,
      recipients: { create: [{ parentId: parent.id }] },
    },
  });

  console.log('Seeded report id:', report.id);
  console.log('Seeded notification id:', notification.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding completed.');
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
