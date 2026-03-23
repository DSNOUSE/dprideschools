import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    // Get database stats
    const studentCount = await prisma.student.count();
    const reportCount = await prisma.report.count();
    const reportWithCommentsCount = await prisma.report.count({
      where: { 
        comment: { not: '' },
        status: 'PUBLISHED'
      }
    });
    
    // Get sample data
    const sampleStudents = await prisma.student.findMany({
      take: 3,
      include: { class: true, session: true }
    });
    
    const sampleReports = await prisma.report.findMany({
      take: 3,
      where: { 
        comment: { not: '' },
        status: 'PUBLISHED'
      },
      include: { 
        student: true,
        teacher: { select: { name: true } }
      }
    });

    return NextResponse.json({
      databaseStats: {
        studentCount,
        reportCount,
        reportWithCommentsCount
      },
      sampleData: {
        students: sampleStudents,
        reportsWithComments: sampleReports
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
