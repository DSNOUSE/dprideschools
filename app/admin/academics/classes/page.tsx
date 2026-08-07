import Link from 'next/link';
import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Academic Classes | DPRIDE Admin',
  description: 'Manage academic classes and class assignments',
};

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      department: true,
      _count: {
        select: {
          students: true,
          subjects: true,
        }
      }
    },
    orderBy: [
      { department: { name: 'asc' } },
      { sort_order: 'asc' }
    ]
  });

  // Group classes by department
  const groupedByDept = new Map<string, { deptName: string; classes: typeof classes }>();
  for (const cls of classes) {
    const deptName = cls.department?.name || 'Other';
    if (!groupedByDept.has(deptName)) {
      groupedByDept.set(deptName, { deptName, classes: [] });
    }
    groupedByDept.get(deptName)!.classes.push(cls);
  }

  const deptColors: Record<string, string> = {
    'Early Years': 'bg-pink-100 text-pink-800 border-pink-200',
    'Primary': 'bg-blue-100 text-blue-800 border-blue-200',
    'Secondary': 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Classes</h1>
        
        <div className="space-y-6">
          {Array.from(groupedByDept.values()).map((group) => (
            <div key={group.deptName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${deptColors[group.deptName] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {group.deptName}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mt-2">{group.deptName} Classes</h2>
                <p className="text-sm text-gray-500">{group.classes.length} class{group.classes.length !== 1 ? 'es' : ''}</p>
              </div>
              
              <div className="divide-y">
                {group.classes.map((cls) => (
                  <div key={cls.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Link href={`/admin/academics/classes/${cls.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">{cls.name}</h3>
                          {cls.level && (
                            <p className="text-sm text-gray-500">Level: {cls.level}</p>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{cls._count.students}</div>
                            <div className="text-xs">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{cls._count.subjects}</div>
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
