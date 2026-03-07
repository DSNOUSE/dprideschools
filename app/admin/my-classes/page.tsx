import { prisma } from '@/lib/prisma';

export default async function MyClassesPage() {
  const classes = await prisma.class.findMany({ take: 200, orderBy: { sort_order: 'asc' } });

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">My Classes</h1>
        <div className="grid grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="p-4 bg-white rounded shadow">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500">Level: {c.level ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
