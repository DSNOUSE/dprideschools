import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildLegacyResultPdfHtml } from '@/lib/results/pdf-export';

export const dynamic = 'force-dynamic';

export default async function LegacyResultsPdfPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;

  if (!session || !roles?.includes('Administrator')) {
    redirect('/admin-signin');
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const studentIdParam = Array.isArray(resolvedParams.studentId)
    ? resolvedParams.studentId[0]
    : resolvedParams.studentId;
  const termIdParam = Array.isArray(resolvedParams.termId)
    ? resolvedParams.termId[0]
    : resolvedParams.termId;
  const sessionIdParam = Array.isArray(resolvedParams.sessionId)
    ? resolvedParams.sessionId[0]
    : resolvedParams.sessionId;

  const studentId = studentIdParam || '';
  const termId = termIdParam ? Number(termIdParam) : undefined;
  const sessionId = sessionIdParam ? Number(sessionIdParam) : undefined;

  if (!studentId) {
    return (
      <div className="p-8 text-red-600">
        Student ID is required to generate the legacy result PDF.
      </div>
    );
  }

  const student = await prisma.student.findFirst({
    where: { admissionNo: { equals: studentId, mode: 'insensitive' } },
    include: {
      enrollments: {
        where: sessionId ? { sessionId } : undefined,
        include: { class: true, session: true },
        orderBy: { enrolledAt: 'desc' },
      },
    },
  });

  if (!student) {
    return <div className="p-8 text-red-600">Student not found.</div>;
  }

  const activeSession = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId } })
    : await prisma.session.findFirst({ where: { isActive: true }, orderBy: { id: 'desc' } });

  const activeTerm = termId
    ? await prisma.term.findUnique({ where: { id: termId } })
    : await prisma.term.findFirst({
        where: { sessionId: activeSession?.id ?? 0 },
        orderBy: [{ isActive: 'desc' }, { order: 'asc' }, { id: 'asc' }],
      });

  const enrollment = student.enrollments[0] ?? null;
  const className = enrollment?.class?.name ?? 'Unassigned';
  const sessionName = enrollment?.session?.name ?? activeSession?.name ?? 'Unknown Session';
  const termName = activeTerm?.name ?? 'Unknown Term';

  const subjectRows = await prisma.subjectResult.findMany({
    where: {
      studentId: student.id,
      sessionId: activeSession?.id ?? enrollment?.sessionId ?? 0,
      termId: activeTerm?.id ?? enrollment?.classId ?? 0,
    },
    include: { subject: true },
    orderBy: { subject: { name: 'asc' } },
  });

  const termResult = await prisma.termResult.findFirst({
    where: {
      studentId: student.id,
      sessionId: activeSession?.id ?? enrollment?.sessionId ?? 0,
      termId: activeTerm?.id ?? 0,
    },
  });

  const html = buildLegacyResultPdfHtml({
    student: {
      admissionNo: student.admissionNo,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
    },
    className,
    sessionName,
    termName,
    subjectRows: subjectRows.map((item) => ({
      subject: item.subject.name,
      total: Number(item.totalScore ?? item.percentage ?? 0),
      max: Number(item.maxScore ?? 100),
      grade: item.grade ?? '—',
      remark: item.remark,
    })),
    summary: {
      average: Number(termResult?.average ?? (subjectRows.length ? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0) / subjectRows.length : 0)),
      totalScore: Number(termResult?.totalScore ?? subjectRows.reduce((sum, item) => sum + Number(item.totalScore ?? item.percentage ?? 0), 0)),
      maxScore: Number(termResult?.maxScore ?? subjectRows.reduce((sum, item) => sum + Number(item.maxScore ?? 100), 0)),
      position: termResult?.position ?? null,
    },
  });

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
