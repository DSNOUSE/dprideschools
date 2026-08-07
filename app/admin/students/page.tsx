import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StudentsPage({ searchParams }: { searchParams?: Promise<{ page?: string; q?: string; classId?: string }> }) {
  // Check authentication at the page level
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;
  
  if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
    redirect('/admin-signin');
  }
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page ?? '1');
  const q = resolvedSearchParams?.q ?? '';
  const classId = resolvedSearchParams?.classId ? Number(resolvedSearchParams.classId) : undefined;
  const pageSize = 20;

  const where: any = {};
  if (q) {
    where.OR = [
      { admissionNo: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (classId) {
    where.classId = classId;
  }

  let filteredClassName: string | undefined;
  if (classId) {
    const filteredClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true }
    });
    filteredClassName = filteredClass?.name;
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { lastName: 'asc' }, include: { class: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-lg p-4 md:p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {filteredClassName ? `Students in ${filteredClassName}` : 'Current DPIS Students'}
            </h1>
            {filteredClassName && (
              <Link href="/admin/students" className="text-sm text-blue-600 hover:text-blue-800">
                View all students
              </Link>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <form method="get" className="flex">
              <input 
                name="q" 
                defaultValue={q || ''} 
                placeholder="Search students..." 
                className="px-3 py-2 border rounded-l text-sm flex-1 min-w-[120px]" 
              />
              <button type="submit" className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r text-sm">Search</button>
              {q && (
                <Link 
                  href="/admin/students" 
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Clear
                </Link>
              )}
            </form>
            <Link href="/admin/students/new" className="px-4 py-2 bg-blue-600 text-white rounded text-sm text-center whitespace-nowrap">New Student</Link>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3 mb-6">
          {students.map((s: any) => (
            <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{s.lastName} {s.firstName}</div>
                  <div className="text-sm text-gray-600">ID: {s.admissionNo}</div>
                </div>
                <Link 
                  href={`/admin/students/${s.id}`} 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  View
                </Link>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Class:</span> {s.class?.name ?? s.classId}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-medium">Admission</th>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Class</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.admissionNo}</td>
                    <td className="p-3">{s.lastName} {s.firstName}</td>
                    <td className="p-3">{s.class?.name ?? s.classId}</td>
                    <td className="p-3 text-center">
                      <Link href={`/admin/students/${s.id}`} className="text-blue-600 hover:text-blue-800 font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing page {page} of {totalPages} — {total} students
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} 
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} 
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
