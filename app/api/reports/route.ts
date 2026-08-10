import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function resolveTeacherId(userId: string, userName?: string | null) {
  const existing = await prisma.teacher.findUnique({ where: { userId } });
  if (existing) return existing.id;
  const created = await prisma.teacher.create({
    data: {
      userId,
      fullName: userName || 'Teacher',
    },
  });
  return created.id;
}

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const reports = await prisma.report.findMany({
      where: studentId ? { studentId } : undefined,
      include: {
        teacher: { select: { fullName: true, staffNumber: true } },
        student: true,
        term: true,
      },
      orderBy: { createdAt: 'desc' },
    });

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

  try {
    const body = await request.json();
    const { studentId, termId, grade, comment, teacherRemark, principalRemark } = body;
    const remark = teacherRemark || comment || grade;
    if (!studentId || !termId || !remark) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const teacherId = await resolveTeacherId((session.user as any).id, (session.user as any).name);

    const report = await prisma.report.create({
      data: {
        studentId,
        termId: Number(termId),
        teacherId,
        teacherRemark: remark,
        principalRemark: principalRemark ?? null,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
