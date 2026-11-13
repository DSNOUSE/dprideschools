import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const sessionId = searchParams.get("sessionId");
    const subjectId = searchParams.get("subjectId");

    if (!classId || !sessionId) {
      return NextResponse.json(
        { error: "Class ID and Session ID are required" },
        { status: 400 },
      );
    }

    // FIX-003: Build filter with optional subject enrollment check
    const baseWhere: any = {
      classId: parseInt(classId),
      sessionId: parseInt(sessionId),
      status: { in: ["ACTIVE", "PROMOTED", "REPEATED", "GRADUATED"] },
    };

    // If subject filter provided, try to filter by subject enrollment
    // But if no students are found, fall through to return all class students
    if (subjectId) {
      const studentIds = await prisma.studentSubject.findMany({
        where: {
          offering: {
            subjectId: parseInt(subjectId),
            classId: parseInt(classId),
            sessionId: parseInt(sessionId),
          },
        },
        select: { studentId: true },
        distinct: ["studentId"],
      });

      // Only apply filter if students are found; otherwise show all class students
      if (studentIds.length > 0) {
        baseWhere.studentId = {
          in: studentIds.map((ss) => ss.studentId),
        };
      }
    }

    const enrollments = await prisma.enrollment.findMany({
      where: baseWhere,
      include: {
        student: true,
      },
      orderBy: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
      ],
    });

    const students = enrollments.map((e) => ({
      ...e.student,
      classId: e.classId,
      sessionId: e.sessionId,
      enrollmentStatus: e.status,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
