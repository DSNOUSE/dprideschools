import Link from 'next/link';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StudentView({ params }: Props) {
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  const reports = await prisma.report.findMany({ where: { studentId: id }, orderBy: { createdAt: 'desc' } });

  if (!student) return <div className="p-6">Student not found</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{student.lastName} {student.firstName}</h1>
          <div className="space-x-2">
            <Link href={`/admin/students/${student.id}/reports/new`} className="px-3 py-1 bg-blue-600 text-white rounded">New Report</Link>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="font-semibold">Details</h2>
          <div>Email: N/A</div>
          <div>Class: {student.classId}</div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Reports</h2>
          <div className="space-y-3">
            {reports.length === 0 && <div className="text-sm text-gray-500">No reports yet</div>}
            {reports.map((r: any) => (
              <div key={r.id} className="p-3 bg-white rounded shadow">
                <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="font-medium">{r.subjectId ? `Subject ${r.subjectId}` : 'General'}</div>
                <div>Grade: {r.grade}</div>
                <div className="mt-2 text-sm">{r.comment}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
