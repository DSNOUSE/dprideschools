import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTeacherActivityLogs } from '@/lib/audit/service';

export const dynamic = 'force-dynamic';

// GET /api/admin/audit/teachers - Retrieve teacher activity logs
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can view teacher activity
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      classId: searchParams.get('classId') ? parseInt(searchParams.get('classId')!) : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Validate date ranges
    if (filters.startDate && isNaN(filters.startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 });
    }
    if (filters.endDate && isNaN(filters.endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid end date format' }, { status: 400 });
    }
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // Validate pagination
    if (filters.limit < 1 || filters.limit > 1000) {
      return NextResponse.json({ error: 'Limit must be between 1 and 1000' }, { status: 400 });
    }
    if (filters.offset < 0) {
      return NextResponse.json({ error: 'Offset must be non-negative' }, { status: 400 });
    }

    const logs = await getTeacherActivityLogs(filters);

    return NextResponse.json({
      logs,
      filters,
      count: logs.length,
    });

  } catch (error) {
    console.error('Error fetching teacher activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher activity logs' },
      { status: 500 }
    );
  }
}
