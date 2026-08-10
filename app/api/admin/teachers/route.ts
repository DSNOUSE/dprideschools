import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// GET /api/admin/teachers - Retrieve all teachers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const whereClause: any = {
      roles: {
        some: {
          role: {
            name: {
              in: ['Teacher', 'Administrator']
            }
          }
        }
      }
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { teacher: { staffNumber: { contains: search, mode: 'insensitive' } } },
        { teacher: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const teachers = await prisma.user.findMany({
      where: whereClause,
      include: {
        roles: { include: { role: true } },
        teacher: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      teacherId: teacher.teacher?.staffNumber ?? null,
      teacherRecordId: teacher.teacher?.id ?? null,
      roles: teacher.roles.map(r => r.role.name),
      createdAt: teacher.createdAt.toISOString()
    }));

    return NextResponse.json({
      teachers: formattedTeachers,
      count: formattedTeachers.length
    });

  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/teachers - Create a new teacher
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, teacherId, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    if (teacherId) {
      const existingStaff = await prisma.teacher.findUnique({ where: { staffNumber: teacherId } });
      if (existingStaff) {
        return NextResponse.json(
          { error: 'A teacher with this staff number already exists' },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const teacherRole = await prisma.role.findUnique({ where: { name: 'Teacher' } });
    if (!teacherRole) {
      return NextResponse.json({ error: 'Teacher role not found' }, { status: 500 });
    }

    const newTeacher = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        roles: {
          create: { roleId: teacherRole.id }
        },
        teacher: {
          create: {
            fullName: name || email,
            staffNumber: teacherId || null,
            isActive: true,
          }
        }
      },
      include: {
        roles: { include: { role: true } },
        teacher: true,
      }
    });

    const { createAuditLog, extractRequestInfo, extractTeacherInfo } = await import('@/lib/audit/service');
    const requestInfo = extractRequestInfo(request, session);
    const teacherInfo = extractTeacherInfo(session);

    await createAuditLog({
      entityType: 'Result',
      entityId: newTeacher.id,
      action: 'CREATE',
      oldValues: {},
      newValues: {
        email: newTeacher.email,
        name: newTeacher.name,
        teacherId: newTeacher.teacher?.staffNumber,
        role: 'Teacher'
      },
      changedFields: ['email', 'name', 'teacherId', 'role'],
      userId: (session.user as any)?.id || 'unknown',
      userName: (session.user as any)?.name || 'Unknown',
      userEmail: (session.user as any)?.email || 'unknown@example.com',
      userRole: roles?.join(', ') || 'unknown',
      teacherId: teacherInfo.teacherId,
      teacherFullName: teacherInfo.teacherFullName,
      sessionId: requestInfo.sessionId,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      notes: `New teacher created: ${newTeacher.name || newTeacher.email}`
    });

    return NextResponse.json({
      message: 'Teacher created successfully',
      teacher: {
        id: newTeacher.id,
        email: newTeacher.email,
        name: newTeacher.name,
        teacherId: newTeacher.teacher?.staffNumber ?? null,
        teacherRecordId: newTeacher.teacher?.id ?? null,
        roles: newTeacher.roles.map(r => r.role.name),
        createdAt: newTeacher.createdAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}
