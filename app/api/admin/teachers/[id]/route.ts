import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { teacherId, name, email } = body;

    if (teacherId !== undefined && teacherId !== null) {
      if (typeof teacherId !== 'string' || teacherId.trim().length === 0) {
        return NextResponse.json({ error: 'Teacher ID must be a non-empty string' }, { status: 400 });
      }
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { teacher: true, roles: { include: { role: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const updatedTeacher = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(teacherId !== undefined
          ? {
              teacher: {
                upsert: {
                  create: {
                    fullName: name || existing.name || existing.email,
                    staffNumber: teacherId || null,
                  },
                  update: {
                    staffNumber: teacherId || null,
                    ...(name ? { fullName: name } : {}),
                  },
                },
              },
            }
          : {}),
      },
      include: {
        teacher: true,
        roles: { include: { role: true } },
      },
    });

    const { createAuditLog, extractRequestInfo, extractTeacherInfo } = await import('@/lib/audit/service');
    const requestInfo = extractRequestInfo(request, session);
    const teacherInfo = extractTeacherInfo(session);

    await createAuditLog({
      entityType: 'Result',
      entityId: id,
      action: 'UPDATE',
      oldValues: { teacherId: existing.teacher?.staffNumber ?? null },
      newValues: { teacherId: updatedTeacher.teacher?.staffNumber ?? null },
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
      notes: `Teacher ID updated for ${updatedTeacher.name || updatedTeacher.email}`,
    });

    return NextResponse.json({
      message: 'Teacher updated successfully',
      teacher: {
        id: updatedTeacher.id,
        email: updatedTeacher.email,
        name: updatedTeacher.name,
        teacherId: updatedTeacher.teacher?.staffNumber ?? null,
        roles: updatedTeacher.roles.map((r) => r.role.name),
      },
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}
