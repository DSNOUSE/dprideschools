import { prisma } from '@/lib/prisma';
import { createDepartment, deleteDepartment } from './actions';

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-gray-600">Create and manage departments.</p>
        </div>
        <form action={createDepartment} className="flex gap-2">
          <input name="name" placeholder="Department name" className="border rounded px-3 py-2" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </form>
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">ID</th>
              <th className="text-left p-2 border">Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d: { id: number; name: string }) => (
              <tr key={d.id}>
                <td className="p-2 border">{d.id}</td>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border text-center">
                  <form action={deleteDepartment.bind(null, d.id)}>
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
