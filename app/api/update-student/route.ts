import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Sex } from '@prisma/client';

export const dynamic = 'force-dynamic';

function toSex(value: unknown): Sex | undefined {
  if (!value) return undefined;
  const v = String(value).toUpperCase();
  if (v === 'M' || v === 'MALE') return 'MALE';
  if (v === 'F' || v === 'FEMALE') return 'FEMALE';
  return undefined;
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { admissionNo, newClassId, sex } = body;
    if (!admissionNo) {
      return NextResponse.json({ error: 'Admission number required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { admissionNo },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, session: true },
          take: 1,
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const sexValue = toSex(sex);
    if (sexValue) {
      await prisma.student.update({
        where: { id: student.id },
        data: { sex: sexValue },
      });
    }

    if (newClassId) {
      const activeSession =
        student.enrollments[0]?.sessionId ||
        (await prisma.session.findFirst({ where: { isActive: true }, orderBy: { id: 'desc' } }))?.id;

      if (activeSession) {
        await prisma.enrollment.upsert({
          where: {
            studentId_sessionId: {
              studentId: student.id,
              sessionId: activeSession,
            },
          },
          update: {
            classId: Number(newClassId),
            status: 'ACTIVE',
          },
          create: {
            studentId: student.id,
            sessionId: activeSession,
            classId: Number(newClassId),
            status: 'ACTIVE',
          },
        });
      }
    }

    const updatedStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, session: true },
          take: 1,
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({
      error: 'Failed to update student',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
