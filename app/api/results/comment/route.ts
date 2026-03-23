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

  try {
    const body = await request.json();
    const { studentId, classId, sessionId, termId, comment } = body;

    if (!studentId || !classId || !sessionId || !termId || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a general report (not subject-specific) with the comment
    const report = await prisma.report.create({
      data: {
        studentId,
        termId: Number(termId),
        teacherId: (session.user as any).id,
        grade: 'COMMENT', // Use a special grade to indicate this is a comment-only report
        comment,
        status: 'PUBLISHED', // Auto-publish comments
      },
    });

    return NextResponse.json({ 
      message: 'Comment saved successfully',
      report: {
        id: report.id,
        comment: report.comment,
      }
    });
  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json({ 
      error: 'Failed to save comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
