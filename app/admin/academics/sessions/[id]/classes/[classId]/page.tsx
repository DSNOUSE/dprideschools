import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const dynamic = 'force-dynamic';

export default async function SessionClassDetailPage({
  params,
}: {
  params: Promise<{ id: string; classId: string }>;
}) {
  const resolvedParams = await params;
  const sessionId = parseInt(resolvedParams.id);
  const classId = parseInt(resolvedParams.classId);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  const classData = await prisma.class.findUnique({
    where: { id: classId },
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
  });

  if (!session || !classData) {
    return (
      <Container>
        <div className="py-8">
          <Link href="/admin/academics/sessions" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">
            ← Back to Sessions
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Session or class not found
          </div>
        </div>
      </Container>
    );
  }

  const students = await prisma.enrollment.findMany({
    where: {
      classId,
      sessionId,
      status: { in: ['ACTIVE', 'PROMOTED', 'REPEATED', 'GRADUATED'] },
    },
    include: {
      student: true,
    },
    orderBy: [{ student: { lastName: 'asc' } }, { student: { firstName: 'asc' } }],
  });

  const subjects = await prisma.subjectOffering.findMany({
    where: {
      classId,
      sessionId,
      isActive: true,
    },
    include: {
      subject: true,
    },
    orderBy: { subject: { name: 'asc' } },
  });

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link
            href={`/admin/academics/sessions/${sessionId}/classes`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to {session.name} Classes
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
          <p className="text-gray-600 mt-2">
            {classData.level.name} • {session.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Students Enrolled</h3>
            <p className="text-3xl font-bold text-blue-600">{classData._count.enrollments}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Subjects Offered</h3>
            <p className="text-3xl font-bold text-green-600">{classData._count.offerings}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Level</h3>
            <p className="text-lg font-bold text-purple-600">{classData.level.name}</p>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Subjects</h2>
          </div>
          {subjects.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No subjects assigned to this class
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Code</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Compulsory</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((offering) => (
                    <tr key={offering.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{offering.subject.name}</td>
                      <td className="p-4">{offering.subject.code}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            offering.isCompulsory
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {offering.isCompulsory ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Students in {classData.name}</h2>
          </div>
          {students.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No students enrolled in this class for {session.name}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Admission No</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{enrollment.student.admissionNo}</td>
                      <td className="p-4">
                        {enrollment.student.lastName} {enrollment.student.firstName}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'GRADUATED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
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
      </div>
    </Container>
  );
}
