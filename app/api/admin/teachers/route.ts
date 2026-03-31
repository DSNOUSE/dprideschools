import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// GET /api/admin/teachers - Retrieve all teachers
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can view teachers
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let whereClause: any = {
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
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          teacherId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const teachers = await prisma.user.findMany({
      where: whereClause,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      teacherId: teacher.teacherId,
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
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control - only administrators can create teachers
    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, teacherId, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get Teacher role
    const teacherRole = await prisma.role.findUnique({
      where: { name: 'Teacher' }
    });

    if (!teacherRole) {
      return NextResponse.json(
        { error: 'Teacher role not found' },
        { status: 500 }
      );
    }

    // Create new teacher
    const newTeacher = await prisma.user.create({
      data: {
        email,
        name: name || null,
        teacherId: teacherId || null,
        passwordHash,
        roles: {
          create: {
            roleId: teacherRole.id
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create audit log for teacher creation
    const { createAuditLog, extractRequestInfo, extractTeacherInfo } = await import('@/lib/audit/service');
    const requestInfo = extractRequestInfo(request, session);
    const teacherInfo = extractTeacherInfo(session);

    await createAuditLog({
      entityType: 'Result', // Using Result as entity type for teacher creation
      entityId: newTeacher.id,
      action: 'CREATE',
      oldValues: {},
      newValues: { 
        email: newTeacher.email, 
        name: newTeacher.name, 
        teacherId: newTeacher.teacherId,
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
        teacherId: newTeacher.teacherId,
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
