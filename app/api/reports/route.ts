import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
