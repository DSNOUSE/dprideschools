import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';
import StudentDashboardClient from './client';
import type { ResultData } from '@/lib/results';

export const metadata = {
  title: 'Student Dashboard | DPRIDE Schools',
  description: 'View your academic results and performance',
};

export const dynamic = 'force-dynamic';

interface StudentDashboardPageProps {}

export default async function StudentDashboardPage({}: StudentDashboardPageProps) {
  // 1. Get session (server-side, secure)
  const session = await getSession();

  // 2. Validate authentication and student role
  if (!session?.user) {
    redirect('/signin');
  }

  const userRoles = (session.user as any)?.roles || [];
  if (!userRoles.includes('Student')) {
    redirect('/admin');
  }

  // 3. Extract student context from auth
  const admissionNo = (session.user as any)?.admissionNo;
  const studentName = (session.user as any)?.name;
  const currentSessionId = (session.user as any)?.sessionId;
  const currentClassId = (session.user as any)?.classId;

  if (!admissionNo) {
    redirect('/signin');
  }

  // 4. Fetch student data from database
  const student = await prisma.student.findUnique({
    where: { admissionNo },
    include: {
      enrollments: {
        include: {
          class: { include: { level: true } },
          session: true,
        },
        orderBy: { enrolledAt: 'desc' },
      },
    },
  });

  if (!student) {
    return (
      <Container>
        <div className="py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Student record not found
          </div>
        </div>
      </Container>
    );
  }

  // 5. Fetch all sessions for the selector
  const allSessions = await prisma.session.findMany({
    orderBy: { name: 'desc' },
  });

  // 6. Get current/active session
  const activeSession =
    allSessions.find((s) => s.id === currentSessionId) ||
    allSessions.find((s) => s.isActive) ||
    allSessions[0];

  if (!activeSession) {
    return (
      <Container>
        <div className="py-12">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No academic sessions are configured yet
          </div>
        </div>
      </Container>
    );
  }

  // 7. Fetch terms for the active session
  const termsForSession = await prisma.term.findMany({
    where: { sessionId: activeSession.id },
    orderBy: { startDate: 'asc' },
  });

  if (termsForSession.length === 0) {
    return (
      <Container>
        <div className="py-12">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No terms are configured for the current session
          </div>
        </div>
      </Container>
    );
  }

  // 8. Get the most recent/active term
  const currentTerm = termsForSession[termsForSession.length - 1];

  // 9. Fetch student results for current session/term using the service
  let results: ResultData | null = null;

  try {
    const subjectResults = await prisma.subjectResult.findMany({
      where: {
        studentId: student.id,
        classId: currentClassId || student.enrollments[0]?.classId,
        sessionId: activeSession.id,
        termId: currentTerm.id,
      },
      include: {
        subject: true,
        teacher: {
          select: {
            fullName: true,
            staffNumber: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    if (subjectResults.length > 0) {
      const termResult = await prisma.termResult.findFirst({
        where: {
          studentId: student.id,
          termId: currentTerm.id,
        },
      });

      const totalScore = subjectResults.reduce(
        (sum, g) => sum + Number(g.totalScore ?? g.percentage ?? 0),
        0
      );
      const average = subjectResults.length > 0 ? totalScore / subjectResults.length : 0;
      const maxScore = subjectResults.reduce((sum, g) => sum + Number(g.maxScore ?? 100), 0);

      results = {
        student: {
          admissionNo: student.admissionNo,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName || '',
          sex: student.sex || '',
        },
        class: {
          name: student.enrollments[0]?.class?.name || 'N/A',
        },
        session: {
          name: activeSession.name,
        },
        term: {
          name: currentTerm.name,
        },
        grades: subjectResults.map((g) => ({
          subject: { name: g.subject.name },
          average: Number(g.totalScore ?? g.percentage ?? 0),
          teacher: g.teacher
            ? {
                name: g.teacher.fullName ?? g.teacher.user?.name ?? null,
                teacherId: g.teacher.staffNumber ?? null,
              }
            : null,
        })),
        result: {
          average: termResult?.average ? Number(termResult.average) : average,
          totalScore: termResult?.totalScore ? Number(termResult.totalScore) : totalScore,
          maxScore: maxScore,
          comment: termResult?.classTeacherRemark || undefined,
        },
      } as ResultData;
    }
  } catch (error) {
    console.error('Error fetching results:', error);
  }

  return (
    <Container>
      <StudentDashboardClient
        student={student}
        sessions={allSessions}
        activeSessionId={activeSession.id}
        allTerms={termsForSession}
        activeTermId={currentTerm.id}
        initialResults={results}
        studentName={studentName}
      />
    </Container>
  );
}
