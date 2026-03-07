import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');

    if (!classId || !sessionId) {
      return NextResponse.json(
        { error: 'Class ID and Session ID are required' },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: {
        classId: parseInt(classId),
        sessionId: parseInt(sessionId)
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
