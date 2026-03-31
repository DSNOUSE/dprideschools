import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let reports;
    
    if (studentId) {
      reports = await prisma.report.findMany({
        where: { studentId },
        include: { 
          subject: true, 
          teacher: { select: { name: true, teacherId: true } } 
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      reports = await prisma.report.findMany({
        include: { 
          subject: true, 
          teacher: { select: { name: true, teacherId: true } } 
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    studentId,
    subjectId,
    termId,
    grade,
    comment,
    attendance,
    conduct,
  } = body;

  if (!studentId || !termId || !grade || !comment) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      studentId,
      subjectId: subjectId ? Number(subjectId) : null,
      termId: Number(termId),
      teacherId: (session.user as any).id,
      grade,
      comment,
      attendance: attendance ? Number(attendance) : null,
      conduct: conduct ?? null,
      status: 'DRAFT',
    },
  });

  return NextResponse.json(report);
}
