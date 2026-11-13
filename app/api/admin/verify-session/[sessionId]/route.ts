import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.sessionId);

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get all data for this session
    const enrollments = await prisma.enrollment.findMany({
      where: { sessionId },
    });

    const activeEnrollments = enrollments.filter((e) =>
      ['ACTIVE', 'PROMOTED', 'REPEATED', 'GRADUATED'].includes(e.status)
    );

    const classes = await prisma.class.findMany();

    const subjectOfferings = await prisma.subjectOffering.findMany({
      where: { sessionId, isActive: true },
    });

    const studentSubjects = await prisma.studentSubject.findMany({
      include: {
        offering: {
          select: { sessionId: true },
        },
      },
    });

    // Run verification checks
    const results = {
      totalStudents: {
        status: activeEnrollments.length > 0 ? 'success' : 'warning',
        message: `Total active students: ${activeEnrollments.length}`,
        count: activeEnrollments.length,
      },
      totalClasses: {
        status: classes.length > 0 ? 'success' : 'warning',
        message: `Total classes: ${classes.length}`,
        count: classes.length,
      },
      totalSubjects: {
        status: subjectOfferings.length > 0 ? 'success' : 'warning',
        message: `Total subject offerings: ${subjectOfferings.length}`,
        count: subjectOfferings.length,
      },
      classEnrollments: (() => {
        const classIds = new Set(activeEnrollments.map((e) => e.classId));
        const allClassIds = new Set(classes.map((c) => c.id));
        const unassignedClasses = [...allClassIds].filter((id) => !classIds.has(id));

        if (unassignedClasses.length > 0) {
          return {
            status: 'warning',
            message: `${unassignedClasses.length} class(es) have no enrolled students`,
            details: `Classes without students: ${unassignedClasses.join(', ')}`,
            count: unassignedClasses.length,
          };
        }

        return {
          status: 'success',
          message: 'All classes have at least one enrolled student',
          count: classIds.size,
        };
      })(),
      subjectEnrollments: (() => {
        const validSubjectOfferings = subjectOfferings.filter(
          (so) => classes.find((c) => c.id === so.classId)
        );

        if (validSubjectOfferings.length !== subjectOfferings.length) {
          return {
            status: 'error',
            message: `${subjectOfferings.length - validSubjectOfferings.length} subject offering(s) belong to non-existent classes`,
            count: validSubjectOfferings.length,
          };
        }

        return {
          status: 'success',
          message: 'All subject offerings belong to valid classes',
          count: validSubjectOfferings.length,
        };
      })(),
      orphanedEnrollments: (() => {
        const validClassIds = new Set(classes.map((c) => c.id));
        const orphaned = activeEnrollments.filter(
          (e) => !validClassIds.has(e.classId)
        );

        if (orphaned.length > 0) {
          return {
            status: 'error',
            message: `${orphaned.length} student(s) enrolled in non-existent classes`,
            count: orphaned.length,
          };
        }

        return {
          status: 'success',
          message: 'No orphaned enrollments found',
          count: 0,
        };
      })(),
      missingClassAssignments: (() => {
        const unassignedStudents = activeEnrollments.filter(
          (e) => !e.classId
        );

        if (unassignedStudents.length > 0) {
          return {
            status: 'error',
            message: `${unassignedStudents.length} student(s) missing class assignment`,
            count: unassignedStudents.length,
          };
        }

        return {
          status: 'success',
          message: 'All students have valid class assignments',
          count: activeEnrollments.length,
        };
      })(),
      dataIntegrity: (() => {
        const issues: string[] = [];

        // Filter student subjects for this session
        const sessionStudentSubjects = studentSubjects.filter(
          (ss) => ss.offering.sessionId === sessionId
        );

        // Check for duplicate enrollments
        const enrollmentMap = new Map<string, number>();
        for (const e of activeEnrollments) {
          const key = `${e.studentId}-${sessionId}`;
          const count = enrollmentMap.get(key) || 0;
          enrollmentMap.set(key, count + 1);
        }

        const duplicates = [...enrollmentMap.entries()].filter((e) => e[1] > 1);
        if (duplicates.length > 0) {
          issues.push(`${duplicates.length} duplicate enrollment(s) detected`);
        }

        // Check subject assignments
        const activeEnrollmentIds = new Set(activeEnrollments.map((e) => e.id));
        const studentsWithSubjects = sessionStudentSubjects.filter(
          (ss) => activeEnrollmentIds.has(ss.studentId as any)
        );

        if (studentsWithSubjects.length === 0 && activeEnrollments.length > 0) {
          issues.push(
            `${activeEnrollments.length} student(s) without subject assignments`
          );
        }

        if (issues.length > 0) {
          return {
            status: 'error',
            message: 'Data integrity issues detected',
            details: issues.join('; '),
            count: issues.length,
          };
        }

        return {
          status: 'success',
          message: 'All data integrity checks passed',
          count: 0,
        };
      })(),
    };

    return NextResponse.json({
      sessionId,
      sessionName: session.name,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
