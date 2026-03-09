import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AttendanceLineChart from '@/components/admin/AttendanceLineChart';
import RightSidebar from '@/components/admin/RightSidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const [studentCount, classCount, teacherCount, staffCount] = await Promise.all([
    prisma.student.count(),
    prisma.class.count(),
    prisma.userRole.count({ where: { role: { name: 'Teacher' } } }),
    prisma.userRole.count({ where: { role: { name: 'Staff' } } }),
  ]);

  const recentStudents = await prisma.student.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { class: true }
  });

  const getAge = (d?: Date | null) => {
    if (!d) return '-';
    const dob = new Date(d as unknown as string);
    const diff = Date.now() - dob.getTime();
    const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  // Simple attendance estimates (no attendance table yet)
  const presentStudents = Math.round(studentCount * 0.95);
  const absentStudents = Math.max(0, studentCount - presentStudents);

  const presentTeachers = Math.round(teacherCount * 0.92);
  const absentTeachers = Math.max(0, teacherCount - presentTeachers);

  const presentStaff = Math.round(staffCount * 0.9);
  const absentStaff = Math.max(0, staffCount - presentStaff);

  // Recent notifications -> events/inbox
  const recentNotifications = await prisma.notification.findMany({
    orderBy: { sentAt: 'desc' },
    take: 6,
  });

  // generate simple trend data for charts (percent-ish values)
  const makeTrend = (basePct: number) => {
    const arr: number[] = [];
    for (let i = 0; i < 24; i++) {
      const jitter = (Math.sin(i / 3) + Math.cos(i / 5)) * 3;
      arr.push(Math.max(10, Math.min(100, Math.round(basePct + jitter + (Math.random() - 0.5) * 4))));
    }
    return arr;
  };

  const studentsTrend = makeTrend(Math.round((presentStudents / Math.max(1, studentCount)) * 100));
  const teachersTrend = makeTrend(Math.round((presentTeachers / Math.max(1, teacherCount)) * 100));
  const staffTrend = makeTrend(Math.round((presentStaff / Math.max(1, staffCount)) * 100));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/admin/students" className="px-3 py-2 bg-blue-600 text-white rounded text-sm md:text-base text-center">Manage Students</Link>
          <Link href="/admin/notifications/send" className="px-3 py-2 bg-amber-500 text-white rounded text-sm md:text-base text-center">Send Notification</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Students</div>
          <div className="text-2xl font-bold">{studentCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Teachers</div>
          <div className="text-2xl font-bold">{teacherCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Working Staff</div>
          <div className="text-2xl font-bold">{staffCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <div className="text-sm text-gray-500">Overview</div>
          </div>
          <div className="space-y-4">
            <AttendanceLineChart data={studentsTrend} color="#10b981" label="Student" />
            <AttendanceLineChart data={teachersTrend} color="#f59e0b" label="Teacher" />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Students directory (recent)</h3>
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Admission</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-left">Gender</th>
                    <th className="p-2 text-left">Age</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.admissionNo}</td>
                      <td className="p-2">{s.lastName} {s.firstName}</td>
                      <td className="p-2">{s.class?.name ?? s.classId}</td>
                      <td className="p-2">{s.sex === 'M' ? 'Male' : s.sex === 'F' ? 'Female' : (s.sex ?? '-')}</td>
                      <td className="p-2">{getAge(s.birthDate)}</td>
                      <td className="p-2 text-center">
                        <Link href={`/admin/students/${s.id}`} className="text-blue-600">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Link href="/admin/students" className="text-sm text-blue-600">View all students</Link>
            </div>
          </div>
        </section>

        <aside>
          <RightSidebar studentsCount={presentStudents} teachersCount={presentTeachers} staffCount={presentStaff} recent={recentStudents.map(s=>({id:s.id,name:`${s.firstName} ${s.lastName}`, role:'Student', when:'7 mins ago'}))} />
        </aside>
      </div>
    </div>
  );
}
