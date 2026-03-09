// Check student count and data in database
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    
    // Get total student count
    const totalStudents = await prisma.student.count();
    
    // Get students by class
    const studentsByClass = await prisma.student.groupBy({
      by: ['classId'],
      _count: true
    });
    
    // Get class details
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    
    // Get sample students
    const sampleStudents = await prisma.student.findMany({
      take: 10,
      include: {
        class: true,
        session: true
      }
    });
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      summary: {
        totalStudents,
        classesWithData: studentsByClass.length,
        totalClasses: classes.length
      },
      classes: classes.map(cls => ({
        name: cls.name,
        studentCount: cls._count.students,
        id: cls.id
      })),
      sampleStudents: sampleStudents.map(student => ({
        admissionNo: student.admissionNo,
        name: `${student.firstName} ${student.middleName || ''} ${student.lastName}`,
        class: student.class?.name || 'None',
        session: student.session?.name || 'None'
      })),
      databaseStatus: 'Connected'
    });
    
  } catch (error) {
    console.error('❌ Student count check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      summary: {
        totalStudents: 0,
        classesWithData: 0,
        totalClasses: 0
      }
    });
  }
}
