import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Academic Subjects | DPRIDE Admin',
  description: 'Manage academic subjects and curriculum',
};

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const activeSession = await prisma.session.findFirst({
    where: { isActive: true },
    orderBy: { id: 'desc' },
  });

  const offerings = await prisma.subjectOffering.findMany({
    where: {
      isActive: true,
      ...(activeSession ? { sessionId: activeSession.id } : {}),
    },
    include: {
      subject: true,
      class: { include: { level: true } },
    },
    orderBy: [
      { class: { level: { section: 'asc' } } },
      { class: { sortOrder: 'asc' } },
      { subject: { name: 'asc' } },
    ],
  });

  const grouped = new Map<string, { className: string; section: string; sortKey: number; subjects: typeof offerings }>();

  for (const offering of offerings) {
    const className = offering.class?.name ?? 'General';
    const section = offering.class?.level?.section?.replaceAll('_', ' ') ?? 'Other';
    const sortKey = offering.class?.sortOrder ?? 9999;
    const key = `${section}::${className}`;
    if (!grouped.has(key)) grouped.set(key, { className, section, sortKey, subjects: [] });
    grouped.get(key)!.subjects.push(offering);
  }

  const sortedGroups = [...grouped.values()].sort((a, b) => {
    const sectionOrder: Record<string, number> = { 'EARLY YEARS': 0, PRIMARY: 1, SECONDARY: 2 };
    const sa = sectionOrder[a.section] ?? 3;
    const sb = sectionOrder[b.section] ?? 3;
    if (sa !== sb) return sa - sb;
    return a.sortKey - b.sortKey;
  });

  const sectionColors: Record<string, string> = {
    'EARLY YEARS': 'bg-pink-100 text-pink-800 border-pink-200',
    PRIMARY: 'bg-blue-100 text-blue-800 border-blue-200',
    SECONDARY: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="py-8 px-2 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Subjects</h1>
          <p className="text-gray-500 mt-1">{offerings.length} offerings across {grouped.size} groups</p>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">No subjects found</h2>
          <p className="text-gray-500">Subjects will appear here once they are configured.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div key={`${group.section}-${group.className}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${sectionColors[group.section] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {group.section}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{group.className}</h2>
                <span className="ml-auto text-sm text-gray-500">{group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y">
                {group.subjects.map((offering) => (
                  <div key={offering.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {offering.subject.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{offering.subject.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{offering.isCompulsory ? 'Compulsory' : 'Elective'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
