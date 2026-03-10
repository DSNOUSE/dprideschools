import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let subjects;

    if (classId) {
      // Get the class to determine its section
      const classInfo = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
        include: { department: true }
      });

      if (!classInfo) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      // Determine section based on department name
      let section = 'Primary'; // default
      if (classInfo.department.name.toLowerCase().includes('nursery') || 
          classInfo.department.name.toLowerCase().includes('early years')) {
        section = 'Nursery';
      } else if (classInfo.department.name.toLowerCase().includes('secondary')) {
        section = 'Secondary';
      }

      // Get subjects specific to this section
      subjects = await prisma.subject.findMany({
        where: {
          section: section
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
