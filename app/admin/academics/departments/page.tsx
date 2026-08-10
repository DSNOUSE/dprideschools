import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createDepartment, deleteDepartment } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;
  if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) redirect('/admin-signin');

  const levels = await prisma.classLevel.findMany({ orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }] });

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Sections / Levels</h1>
          <p className="text-gray-600">Departments were replaced by school sections and class levels.</p>
        </div>
        <form action={createDepartment} className="flex gap-2">
          <input name="name" placeholder="Level name (e.g. Year 10)" className="border rounded px-3 py-2" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Level</button>
        </form>
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">ID</th>
              <th className="text-left p-2 border">Name</th>
              <th className="text-left p-2 border">Section</th>
              <th className="text-left p-2 border">Code</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id}>
                <td className="p-2 border">{level.id}</td>
                <td className="p-2 border">{level.name}</td>
                <td className="p-2 border">{level.section.replaceAll('_', ' ')}</td>
                <td className="p-2 border">{level.code}</td>
                <td className="p-2 border text-center">
                  <form action={deleteDepartment.bind(null, level.id)}>
                    <button className="text-red-600">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
