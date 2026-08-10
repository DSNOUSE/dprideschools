import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Classes | DPRIDE Admin',
  description: 'Manage academic classes and class assignments',
};

export const dynamic = 'force-dynamic';

function sectionLabel(section: string) {
  return section.replaceAll('_', ' ');
}

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      level: true,
      _count: {
        select: {
          enrollments: true,
          offerings: true,
        },
      },
    },
    orderBy: [
      { level: { section: 'asc' } },
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  });

  const groupedBySection = new Map<string, { sectionName: string; classes: typeof classes }>();
  for (const cls of classes) {
    const sectionName = sectionLabel(cls.level.section);
    if (!groupedBySection.has(sectionName)) {
      groupedBySection.set(sectionName, { sectionName, classes: [] });
    }
    groupedBySection.get(sectionName)!.classes.push(cls);
  }

  const sectionColors: Record<string, string> = {
    'EARLY YEARS': 'bg-pink-100 text-pink-800 border-pink-200',
    PRIMARY: 'bg-blue-100 text-blue-800 border-blue-200',
    SECONDARY: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Classes</h1>

        <div className="space-y-6">
          {Array.from(groupedBySection.values()).map((group) => (
            <div key={group.sectionName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    sectionColors[group.sectionName] || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {group.sectionName}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mt-2">{group.sectionName} Classes</h2>
                <p className="text-sm text-gray-500">
                  {group.classes.length} class{group.classes.length !== 1 ? 'es' : ''}
                </p>
              </div>

              <div className="divide-y">
                {group.classes.map((cls) => (
                  <div key={cls.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Link href={`/admin/academics/classes/${cls.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">{cls.name}</h3>
                          <p className="text-sm text-gray-500">Level: {cls.level.name}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{cls._count.enrollments}</div>
                            <div className="text-xs">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{cls._count.offerings}</div>
                            <div className="text-xs">Subjects</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {classes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
            <p className="text-gray-500">No classes found. Classes will appear here once configured.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
