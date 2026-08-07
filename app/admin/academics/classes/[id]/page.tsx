import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Class Details | DPRIDE Admin',
  description: 'View class details, students, and subjects',
};

export const dynamic = 'force-dynamic';

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classId = Number(resolvedParams.id);

  const [classData, students, subjects] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      include: {
        department: true,
      }
    }),
    prisma.student.findMany({
      where: { classId },
      orderBy: { lastName: 'asc' },
      include: {
        session: true,
      }
    }),
    prisma.subject.findMany({
      where: { classId },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!classData) {
    return (
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Class Not Found</h1>
          <Link href="/admin/academics/classes" className="text-blue-600 hover:text-blue-800">
            ← Back to Classes
          </Link>
        </div>
      </Container>
    );
  }

  const deptColors: Record<string, string> = {
    'Early Years': 'bg-pink-100 text-pink-800 border-pink-200',
    'Primary': 'bg-blue-100 text-blue-800 border-blue-200',
    'Secondary': 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href="/admin/academics/classes" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Classes
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${deptColors[classData.department?.name || ''] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {classData.department?.name || 'No Department'}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{classData.name}</h1>
              {classData.level && (
                <p className="text-gray-600 mt-1">Level: {classData.level}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Students ({students.length})</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {students.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No students enrolled in this class
                </div>
              ) : (
                students.map((student) => (
                  <Link
                    key={student.id}
                    href={`/admin/students/${student.id}`}
                    className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {student.lastName} {student.firstName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.admissionNo} • {student.session?.name || 'No Session'}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Subjects Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Subjects ({subjects.length})</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {subjects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No subjects assigned to this class
                </div>
              ) : (
                subjects.map((subject) => (
                  <div key={subject.id} className="px-6 py-3">
                    <div className="font-medium text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-500">
                      Max Score: {subject.maxScore}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}