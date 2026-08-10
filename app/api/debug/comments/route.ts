import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const studentCount = await prisma.student.count();
    const reportCount = await prisma.report.count();
    const reportWithCommentsCount = await prisma.report.count({
      where: {
        teacherRemark: { not: null },
        status: 'PUBLISHED',
      },
    });

    const sampleStudents = await prisma.student.findMany({
      take: 3,
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, session: true },
          take: 1,
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    const sampleReports = await prisma.report.findMany({
      take: 3,
      where: {
        teacherRemark: { not: null },
        status: 'PUBLISHED',
      },
      include: {
        student: true,
        teacher: { select: { fullName: true, staffNumber: true } },
      },
    });

    return NextResponse.json({
      databaseStats: {
        studentCount,
        reportCount,
        reportWithCommentsCount,
      },
      sampleData: {
        students: sampleStudents,
        reportsWithComments: sampleReports,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
