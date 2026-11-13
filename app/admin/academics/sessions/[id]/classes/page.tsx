import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const dynamic = 'force-dynamic';

export default async function SessionClassesPage({ params }: { params: Promise<{ id: string }> }) {
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

  const classesData = await prisma.class.findMany({
    include: {
      level: true,
      _count: {
        select: {
          enrollments: {
            where: {
              sessionId,
              status: { in: ['ACTIVE', 'PROMOTED', 'REPEATED', 'GRADUATED'] },
            },
          },
          offerings: {
            where: { sessionId },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const classesWithData = classesData.map((cls) => ({
    ...cls,
    studentCount: cls._count.enrollments,
    subjectCount: cls._count.offerings,
  }));

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
          <p className="text-gray-600 mt-2">Classes & Enrollments</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Classes</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {classesWithData.length} Classes
              </span>
            </div>
          </div>

          {classesWithData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No classes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Class Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Level</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Students</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Subjects</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classesWithData.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{cls.name}</td>
                      <td className="p-4">{cls.level.name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                          {cls.studentCount}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                          {cls.subjectCount}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/academics/classes/${cls.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/academics/sessions/${sessionId}/classes/${cls.id}`}
                            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Total Classes</h3>
            <p className="text-3xl font-bold text-blue-600">{classesWithData.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Total Enrollments</h3>
            <p className="text-3xl font-bold text-green-600">
              {classesWithData.reduce((sum, cls) => sum + cls.studentCount, 0)}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Total Subject Offerings</h3>
            <p className="text-3xl font-bold text-purple-600">
              {classesWithData.reduce((sum, cls) => sum + cls.subjectCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
