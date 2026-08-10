import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');

    if (!classId || !sessionId) {
      return NextResponse.json(
        { error: 'Class ID and Session ID are required' },
        { status: 400 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId: parseInt(classId),
        sessionId: parseInt(sessionId),
        status: 'ACTIVE',
      },
      include: {
        student: true,
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
      ],
    });

    const students = enrollments.map((e) => ({
      ...e.student,
      classId: e.classId,
      sessionId: e.sessionId,
      enrollmentStatus: e.status,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
