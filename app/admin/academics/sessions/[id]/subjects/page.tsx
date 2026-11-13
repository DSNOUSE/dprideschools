import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const dynamic = 'force-dynamic';

export default async function SessionSubjectsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const subjectOfferings = await prisma.subjectOffering.findMany({
    where: {
      sessionId,
      isActive: true,
    },
    include: {
      subject: true,
      class: { include: { level: true } },
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: [{ class: { name: 'asc' } }, { subject: { name: 'asc' } }],
  });

  const subjectStats = subjectOfferings.reduce(
    (acc, offering) => {
      const existing = acc.find((s) => s.subjectId === offering.subjectId);
      if (existing) {
        existing.classCount += 1;
        existing.studentCount += offering._count.students;
      } else {
        acc.push({
          subjectId: offering.subjectId,
          subjectName: offering.subject.name,
          subjectCode: offering.subject.code || 'N/A',
          classCount: 1,
          studentCount: offering._count.students,
        });
      }
      return acc;
    },
    [] as Array<{
      subjectId: number;
      subjectName: string;
      subjectCode: string;
      classCount: number;
      studentCount: number;
    }>
  );

  subjectStats.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

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
          <p className="text-gray-600 mt-2">Subject Enrollment Overview</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Subjects by Class</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {subjectStats.length} Unique Subjects
              </span>
            </div>
          </div>

          {subjectStats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No subject offerings for this session
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Code</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Classes Offered</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Total Students</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map((stat) => (
                    <tr key={stat.subjectId} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{stat.subjectName}</td>
                      <td className="p-4 text-gray-600">{stat.subjectCode}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                          {stat.classCount}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                          {stat.studentCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Offerings</h2>
          </div>

          {subjectOfferings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No subject offerings for this session
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Class</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Students Taking</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectOfferings.map((offering) => (
                    <tr key={offering.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{offering.class.name}</td>
                      <td className="p-4">
                        {offering.subject.name} ({offering.subject.code})
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                          {offering._count.students}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/admin/academics/sessions/${sessionId}/classes/${offering.classId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Class
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Total Subject Offerings</h3>
            <p className="text-3xl font-bold text-green-600">{subjectOfferings.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Unique Subjects</h3>
            <p className="text-3xl font-bold text-blue-600">{subjectStats.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Total Student Registrations</h3>
            <p className="text-3xl font-bold text-purple-600">
              {subjectOfferings.reduce((sum, o) => sum + o._count.students, 0)}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
