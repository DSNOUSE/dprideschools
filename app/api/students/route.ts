import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Sex } from '@prisma/client';

export const dynamic = 'force-dynamic';

function toSex(value: unknown): Sex | null {
  if (!value) return null;
  const v = String(value).toUpperCase();
  if (v === 'M' || v === 'MALE') return 'MALE';
  if (v === 'F' || v === 'FEMALE') return 'FEMALE';
  return null;
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { admissionNo, firstName, lastName, middleName, sex, birthDate, classId, sessionId } = body;

    if (!admissionNo || !firstName || !lastName || !classId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingStudent = await prisma.student.findFirst({ where: { admissionNo } });
    if (existingStudent) {
      return NextResponse.json({ error: 'Student with this admission number already exists' }, { status: 409 });
    }

    const student = await prisma.student.create({
      data: {
        admissionNo,
        firstName,
        lastName,
        middleName: middleName || null,
        sex: toSex(sex),
        birthDate: birthDate ? new Date(birthDate) : null,
        enrollments: {
          create: {
            classId: Number(classId),
            sessionId: Number(sessionId),
            status: 'ACTIVE',
          },
        },
      },
      include: {
        enrollments: {
          include: { class: true, session: true },
          take: 1,
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { admissionNo: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: whereClause }),
      prisma.student.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastName: 'asc' },
        include: {
          enrollments: {
            include: { class: true, session: true },
            take: 1,
            orderBy: { enrolledAt: 'desc' },
          },
        },
      }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
