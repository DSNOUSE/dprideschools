import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Find student
    const student = await prisma.student.findFirst({
      where: { admissionNo },
      include: { class: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log('Found student:', {
      id: student.id,
      admissionNo: student.admissionNo,
      name: `${student.firstName} ${student.lastName}`,
      currentClass: student.class?.name,
      currentSex: student.sex
    });

    // Update student
    const updateData: any = {};
    if (newClassId) updateData.classId = Number(newClassId);
    if (sex) updateData.sex = sex;

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: updateData,
      include: { class: true }
    });

    console.log('Updated student:', {
      id: updatedStudent.id,
      admissionNo: updatedStudent.admissionNo,
      name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
      newClass: updatedStudent.class?.name,
      newSex: updatedStudent.sex
    });

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ 
      error: 'Failed to update student',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
