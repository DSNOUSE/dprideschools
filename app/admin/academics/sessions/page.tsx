import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Sessions | DPRIDE Admin',
  description: 'Manage academic sessions, view students, classes, and subjects',
};

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { id: 'desc' },
    include: {
      _count: {
        select: {
          enrollments: true,
          offerings: true,
          terms: true,
        },
      },
    },
  });

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Sessions</h1>
          <p className="text-gray-600">Manage sessions, view enrolled students, classes, and subject offerings</p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No academic sessions configured yet</p>
            <p className="text-gray-400 text-sm mt-2">Sessions will appear here once created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Link key={session.id} href={`/admin/academics/sessions/${session.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{session.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.startDate && session.endDate
                          ? `${new Date(session.startDate).toLocaleDateString()} - ${new Date(session.endDate).toLocaleDateString()}`
                          : 'No dates configured'}
                      </p>
                    </div>
                    {session.isActive && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{session._count.enrollments}</div>
                      <div className="text-xs text-gray-500 mt-1">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{session._count.offerings}</div>
                      <div className="text-xs text-gray-500 mt-1">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{session._count.terms}</div>
                      <div className="text-xs text-gray-500 mt-1">Terms</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex gap-2">
                    <span className="text-xs text-blue-600 font-medium">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
