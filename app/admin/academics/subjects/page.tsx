import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Academic Subjects | DPRIDE Admin',
  description: 'Manage academic subjects and curriculum',
};

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      class: { include: { department: true } },
      department: true,
    },
    orderBy: [
      { section: 'asc' },
      { class: { sort_order: 'asc' } },
      { name: 'asc' },
    ],
  });

  // Group subjects by their class (or "General" for unassigned)
  const grouped = new Map<string, { className: string; section: string; sortKey: number; subjects: typeof subjects }>();

  for (const subj of subjects) {
    const className = subj.class?.name ?? 'General';
    const section = subj.section ?? subj.class?.department?.name ?? 'Other';
    const sortKey = subj.class?.sort_order ?? 9999;
    const key = `${section}::${className}`;

    if (!grouped.has(key)) {
      grouped.set(key, { className, section, sortKey, subjects: [] });
    }
    grouped.get(key)!.subjects.push(subj);
  }

  // Sort groups: by section name then by class sort_order
  const sortedGroups = [...grouped.values()].sort((a, b) => {
    const sectionOrder: Record<string, number> = { Nursery: 0, Primary: 1, Secondary: 2 };
    const sa = sectionOrder[a.section] ?? 3;
    const sb = sectionOrder[b.section] ?? 3;
    if (sa !== sb) return sa - sb;
    return a.sortKey - b.sortKey;
  });

  const sectionColors: Record<string, string> = {
    Nursery: 'bg-pink-100 text-pink-800 border-pink-200',
    Primary: 'bg-blue-100 text-blue-800 border-blue-200',
    Secondary: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="py-8 px-2 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Subjects</h1>
          <p className="text-gray-500 mt-1">{subjects.length} subjects across {grouped.size} groups</p>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253V6.253z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">No subjects found</h2>
          <p className="text-gray-500">Subjects will appear here once they are configured.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div key={`${group.section}-${group.className}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${sectionColors[group.section] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {group.section}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{group.className}</h2>
                <span className="ml-auto text-sm text-gray-500">{group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Subject list */}
              <div className="divide-y">
                {group.subjects.map((subj) => (
                  <div key={subj.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {subj.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{subj.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">Max: {subj.maxScore}</span>
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
