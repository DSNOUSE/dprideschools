import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let subjects;

    if (classId) {
      // Get subjects specific to this class
      subjects = await prisma.subject.findMany({
        where: {
          OR: [
            { classId: parseInt(classId) },
            { classId: null }
          ]
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      // Get all subjects
      subjects = await prisma.subject.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
