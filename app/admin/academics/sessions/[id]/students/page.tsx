import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const dynamic = 'force-dynamic';

export default async function SessionStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sessionId = parseInt(resolvedParams.id);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return (
      <Container>
        <div className="py-8">
          <Link href="/admin/academics/sessions" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">
            ← Back to Sessions
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Session not found
          </div>
        </div>
      </Container>
    );
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      sessionId,
      status: { in: ['ACTIVE', 'PROMOTED', 'REPEATED', 'GRADUATED'] },
    },
    include: {
      student: true,
      class: { include: { level: true } },
    },
    orderBy: [
      { student: { lastName: 'asc' } },
      { student: { firstName: 'asc' } },
    ],
  });

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href={`/admin/academics/sessions/${sessionId}`} className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to {session.name}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
          <p className="text-gray-600 mt-2">Enrolled Students</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Students</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {enrollments.length} Students
              </span>
            </div>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No students enrolled in this session
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Admission No</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Class</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Level</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{enrollment.student.admissionNo}</td>
                      <td className="p-4">{enrollment.student.lastName} {enrollment.student.firstName}</td>
                      <td className="p-4">{enrollment.class.name}</td>
                      <td className="p-4">{enrollment.class.level.name}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                          enrollment.status === 'REPEATED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/admin/students/${enrollment.student.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Data Summary for {session.name}</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Total Students: <span className="font-bold">{enrollments.length}</span></li>
            <li>✓ Classes: <span className="font-bold">{new Set(enrollments.map(e => e.classId)).size}</span></li>
            <li>✓ Enrollment Status: <span className="font-bold">Active & Complete</span></li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
