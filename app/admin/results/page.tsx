import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLegacyResultsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; classId?: string; sessionId?: string; termId?: string }>; 
}) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;

  if (!session || !roles?.includes('Administrator')) {
    redirect('/admin-signin');
  }

  const resolved = await searchParams;
  const q = resolved?.q ?? '';
  const classIdParam = resolved?.classId ? Number(resolved.classId) : undefined;
  const sessionIdParam = resolved?.sessionId ? Number(resolved.sessionId) : undefined;
  const termIdParam = resolved?.termId ? Number(resolved.termId) : undefined;

  const [classes, sessions, terms, students] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.session.findMany({ orderBy: { id: 'asc' } }),
    prisma.term.findMany({ orderBy: { order: 'asc' } }),
    prisma.student.findMany({
      where: q
        ? {
            OR: [
              { admissionNo: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        enrollments: { where: classIdParam ? { classId: classIdParam, status: 'ACTIVE' } : { status: 'ACTIVE' }, include: { class: true, session: true }, take: 1, orderBy: { enrolledAt: 'desc' } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 60,
    }),
  ]);

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legacy Results PDF Export</h1>
            <p className="text-sm text-gray-600">Admin-only export for legacy student result records.</p>
          </div>
        </div>

        <form method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or admission"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select name="classId" defaultValue={classIdParam ?? ''} className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select name="sessionId" defaultValue={sessionIdParam ?? ''} className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">All sessions</option>
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select name="termId" defaultValue={termIdParam ?? ''} className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Latest term</option>
            {terms.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Filter
          </button>
        </form>

        <form action="/api/admin/results/pdf" method="GET" className="mb-6 flex flex-wrap items-center gap-3">
          <input type="hidden" name="all" value="true" />
          {termIdParam ? <input type="hidden" name="termId" value={termIdParam} /> : null}
          <select name="sessionId" defaultValue={sessionIdParam ?? ''} className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select session for one PDF</option>
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Download Session PDF
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Admission</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Session</th>
                <th className="p-3 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const activeEnrollment = student.enrollments[0];
                const sessionId = sessionIdParam ?? activeEnrollment?.sessionId;
                const termId = termIdParam ?? undefined;
                const href = `/api/admin/results/pdf?studentId=${encodeURIComponent(student.admissionNo)}${sessionId ? `&sessionId=${sessionId}` : ''}${termId ? `&termId=${termId}` : ''}`;

                return (
                  <tr key={student.id} className="border-t">
                    <td className="p-3">{student.admissionNo}</td>
                    <td className="p-3">{student.lastName} {student.firstName}</td>
                    <td className="p-3">{activeEnrollment?.class?.name ?? '—'}</td>
                    <td className="p-3">{activeEnrollment?.session?.name ?? '—'}</td>
                    <td className="p-3 text-right">
                      <a href={href} className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">
                        Download PDF
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
