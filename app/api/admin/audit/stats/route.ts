import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuditStats } from '@/lib/audit/service';

export const dynamic = 'force-dynamic';

// GET /api/admin/audit/stats - Retrieve audit statistics
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can view audit stats
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') as 'day' | 'week' | 'month') || 'week';

    // Validate timeframe
    if (!['day', 'week', 'month'].includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe. Use "day", "week", or "month"' }, { status: 400 });
    }

    const stats = await getAuditStats(timeframe);

    return NextResponse.json({
      stats,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
}
