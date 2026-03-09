const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const admissionNos = [
  'DPS2024001',
  'DPS2024002',
  'DPS2024003',
  'DPS2024004',
  'DPS2024005',
  'DPS2024006',
  'DPS2024007',
  'DPS2024008',
  'DPS2024009',
  'DPS2024010',
  'YEAR1001',
  'YEAR1002',
  'YEAR1003',
  'TEST001',
  'TEST002'
];

const parentEmails = [
  'parent1@dprideschools.com',
  'parent2@dprideschools.com',
  'parent3@dprideschools.com',
  'parent4@dprideschools.com',
  'parent5@dprideschools.com'
];

async function cleanupTestData() {
  const shouldDelete = process.env.CONFIRM_DELETE === 'true';

  try {
    const students = await prisma.student.findMany({
      where: { admissionNo: { in: admissionNos } },
      select: { id: true, admissionNo: true }
    });

    const parents = await prisma.parent.findMany({
      where: { email: { in: parentEmails } },
      select: { id: true, email: true }
    });

    console.log(`Found ${students.length} test students and ${parents.length} test parents.`);
    if (students.length > 0) {
      console.log('Students:', students.map((student) => student.admissionNo).join(', '));
    }
    if (parents.length > 0) {
      console.log('Parents:', parents.map((parent) => parent.email).join(', '));
    }

    if (!shouldDelete) {
      console.log('Dry run only. Set CONFIRM_DELETE=true to remove these records.');
      return;
    }

    const studentIds = students.map((student) => student.id);
    const parentIds = parents.map((parent) => parent.id);

    if (studentIds.length > 0) {
      const [gradeResult, resultResult, reportResult, studentParentResult, studentResult] = await prisma.$transaction([
        prisma.grade.deleteMany({ where: { studentId: { in: studentIds } } }),
        prisma.result.deleteMany({ where: { studentId: { in: studentIds } } }),
        prisma.report.deleteMany({ where: { studentId: { in: studentIds } } }),
        prisma.studentParent.deleteMany({ where: { studentId: { in: studentIds } } }),
        prisma.student.deleteMany({ where: { id: { in: studentIds } } })
      ]);

      console.log('Deleted grades:', gradeResult.count);
      console.log('Deleted results:', resultResult.count);
      console.log('Deleted reports:', reportResult.count);
      console.log('Deleted student-parent links:', studentParentResult.count);
      console.log('Deleted students:', studentResult.count);
    }

    if (parentIds.length > 0) {
      const [parentLinkResult, parentResult] = await prisma.$transaction([
        prisma.studentParent.deleteMany({ where: { parentId: { in: parentIds } } }),
        prisma.parent.deleteMany({ where: { id: { in: parentIds } } })
      ]);

      console.log('Deleted parent links:', parentLinkResult.count);
      console.log('Deleted parents:', parentResult.count);
    }
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
