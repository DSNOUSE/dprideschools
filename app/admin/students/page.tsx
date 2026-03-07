import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function StudentsPage({ searchParams }: { searchParams?: { page?: string; q?: string } }) {
  const page = Number(searchParams?.page ?? '1');
  const q = searchParams?.q ?? '';
  const pageSize = 20;

  const where: any = {};
  if (q) {
    where.OR = [
      { admissionNo: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { lastName: 'asc' }, include: { class: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <form method="get" className="flex">
            <input name="q" defaultValue={q} placeholder="Search" className="px-2 py-1 border rounded-l" />
            <button type="submit" className="px-3 py-1 bg-gray-100 border border-l-0 rounded-r">Search</button>
          </form>
          <Link href="/admin/students/new" className="px-3 py-1 bg-blue-600 text-white rounded">New Student</Link>
        </div>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Admission</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.admissionNo}</td>
                <td className="p-2">{s.lastName} {s.firstName}</td>
                <td className="p-2">{s.class?.name ?? s.classId}</td>
                <td className="p-2 text-center">
                  <Link href={`/admin/students/${s.id}`} className="text-blue-600">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing page {page} of {totalPages} — {total} students</div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="px-3 py-1 border rounded">Previous</Link>
          )}
          {page < totalPages && (
            <Link href={`?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="px-3 py-1 border rounded">Next</Link>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
