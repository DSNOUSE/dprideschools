import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, session: true },
          take: 1,
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}
