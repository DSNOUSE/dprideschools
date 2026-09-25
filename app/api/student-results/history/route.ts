import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentHistory } from '@/lib/student-results/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('student')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admissionNo = (session.user as any)?.admissionNo as string | undefined;
    if (!admissionNo) {
      return NextResponse.json({ error: 'Student ID missing from session' }, { status: 400 });
    }

    const data = await getStudentHistory(admissionNo);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching student history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
