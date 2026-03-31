import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/teachers/[id] - Update teacher information
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can update teachers
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { teacherId } = body;

    // Validate teacher ID if provided
    if (teacherId !== undefined && teacherId !== null) {
      if (typeof teacherId !== 'string' || teacherId.trim().length === 0) {
        return NextResponse.json(
          { error: 'Teacher ID must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Update teacher
    const updatedTeacher = await prisma.user.update({
      where: { id },
      data: {
        teacherId: teacherId || null
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create audit log for teacher update
    const { createAuditLog, extractRequestInfo, extractTeacherInfo } = await import('@/lib/audit/service');
    const requestInfo = extractRequestInfo(request, session);
    const teacherInfo = extractTeacherInfo(session);

    await createAuditLog({
      entityType: 'Result', // Using Result as entity type for teacher updates
      entityId: id,
      action: 'UPDATE',
      oldValues: { teacherId: updatedTeacher.teacherId },
      newValues: { teacherId },
      changedFields: ['teacherId'],
      userId: (session.user as any)?.id || 'unknown',
      userName: (session.user as any)?.name || 'Unknown',
      userEmail: (session.user as any)?.email || 'unknown@example.com',
      userRole: roles?.join(', ') || 'unknown',
      teacherId: teacherInfo.teacherId,
      teacherFullName: teacherInfo.teacherFullName,
      sessionId: requestInfo.sessionId,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      notes: `Teacher ID updated for ${updatedTeacher.name || updatedTeacher.email}`
    });

    return NextResponse.json({
      message: 'Teacher updated successfully',
      teacher: {
        id: updatedTeacher.id,
        email: updatedTeacher.email,
        name: updatedTeacher.name,
        teacherId: updatedTeacher.teacherId,
        roles: updatedTeacher.roles.map(r => r.role.name)
      }
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
      { status: 500 }
    );
  }
}
