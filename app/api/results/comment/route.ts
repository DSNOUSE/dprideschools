import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function resolveTeacherId(userId: string, userName?: string | null) {
  const existing = await prisma.teacher.findUnique({ where: { userId } });
  if (existing) return existing.id;
  const created = await prisma.teacher.create({
    data: { userId, fullName: userName || 'Teacher' },
  });
  return created.id;
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { studentId, termId, comment } = body;
    if (!studentId || !termId || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const teacherId = await resolveTeacherId((session.user as any).id, (session.user as any).name);

    const report = await prisma.report.upsert({
      where: {
        studentId_termId: {
          studentId,
          termId: Number(termId),
        },
      },
      update: {
        teacherId,
        teacherRemark: comment,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      create: {
        studentId,
        termId: Number(termId),
        teacherId,
        teacherRemark: comment,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Comment saved successfully',
      report: {
        id: report.id,
        teacherRemark: report.teacherRemark,
      },
    });
  } catch (error) {
    console.error('Error saving teacherRemark:', error);
    return NextResponse.json({
      error: 'Failed to save comment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
