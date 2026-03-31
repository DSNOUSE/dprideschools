import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuditLogs, getAuditStats } from '@/lib/audit/service';

export const dynamic = 'force-dynamic';

// GET /api/admin/audit/logs - Retrieve audit logs with filtering
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can view audit logs
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      userId: searchParams.get('userId') || undefined,
      classId: searchParams.get('classId') ? parseInt(searchParams.get('classId')!) : undefined,
      studentId: searchParams.get('studentId') || undefined,
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

    const logs = await getAuditLogs(filters);

    return NextResponse.json({
      logs,
      filters,
      count: logs.length,
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/audit/logs - Create audit log entry (for manual entries)
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['entityType', 'entityId', 'action', 'newValues', 'notes'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate entityType
    if (!['Grade', 'Result'].includes(body.entityType)) {
      return NextResponse.json(
        { error: 'Entity type must be "Grade" or "Result"' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['CREATE', 'UPDATE', 'DELETE'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Action must be "CREATE", "UPDATE", or "DELETE"' },
        { status: 400 }
      );
    }

    // Import createAuditLog dynamically to avoid circular dependencies
    const { createAuditLog } = await import('@/lib/audit/service');
    
    // Get user information safely
    const userId = (session.user as any)?.id || 'unknown';
    const userName = (session.user as any)?.name || 'Unknown';
    const userEmail = (session.user as any)?.email || 'unknown@example.com';
    
    const auditLog = await createAuditLog({
      ...body,
      userId,
      userName,
      userEmail,
      userRole: roles.join(', '),
      source: 'MANUAL',
    });

    if (!auditLog) {
      return NextResponse.json(
        { error: 'Failed to create audit log entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Audit log entry created successfully',
      auditLog,
    });

  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log entry' },
      { status: 500 }
    );
  }
}
