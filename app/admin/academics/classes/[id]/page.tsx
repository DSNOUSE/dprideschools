import { Metadata } from 'next';
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
  const activeSession = await prisma.session.findFirst({ where: { isActive: true }, orderBy: { id: 'desc' } });

  const [classData, enrollments, offerings] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId }, include: { level: true } }),
    prisma.enrollment.findMany({
      where: { classId, status: 'ACTIVE', ...(activeSession ? { sessionId: activeSession.id } : {}) },
      orderBy: { student: { lastName: 'asc' } },
      include: { student: true, session: true },
    }),
    prisma.subjectOffering.findMany({
      where: { classId, isActive: true, ...(activeSession ? { sessionId: activeSession.id } : {}) },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    }),
  ]);

  if (!classData) {
    return (
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Class Not Found</h1>
          <Link href="/admin/academics/classes" className="text-blue-600 hover:text-blue-800">Back to Classes</Link>
        </div>
      </Container>
    );
  }

  const sectionName = classData.level.section.replaceAll('_', ' ');
  const sectionColors: Record<string, string> = {
    'EARLY YEARS': 'bg-pink-100 text-pink-800 border-pink-200',
    PRIMARY: 'bg-blue-100 text-blue-800 border-blue-200',
    SECONDARY: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href="/admin/academics/classes" className="text-blue-600 hover:text-blue-800 text-sm">Back to Classes</Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${sectionColors[sectionName] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {sectionName}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{classData.name}</h1>
          <p className="text-gray-600 mt-1">Level: {classData.level.name}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Students ({enrollments.length})</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {enrollments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No students enrolled in this class</div>
              ) : (
                enrollments.map((enrollment) => (
                  <Link key={enrollment.id} href={`/admin/students/${enrollment.student.id}`} className="block px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">{enrollment.student.lastName} {enrollment.student.firstName}</div>
                    <div className="text-sm text-gray-500">{enrollment.student.admissionNo} • {enrollment.session?.name || 'No Session'}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Subjects ({offerings.length})</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {offerings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No subjects assigned to this class</div>
              ) : (
                offerings.map((offering) => (
                  <div key={offering.id} className="px-6 py-3">
                    <div className="font-medium text-gray-900">{offering.subject.name}</div>
                    <div className="text-sm text-gray-500">{offering.isCompulsory ? 'Compulsory' : 'Elective'}</div>
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
