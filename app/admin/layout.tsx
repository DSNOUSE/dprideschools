import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;

  if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen py-2 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-none md:rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block p-6 bg-gray-50">
            <nav className="flex flex-col gap-3 h-full">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/dashboard.png" alt="Dashboard" className="w-5 h-5 shrink-0 object-contain" />
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/messenger" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/messenger.png" alt="Messenger" className="w-5 h-5 shrink-0 object-contain" />
                <span>Messenger</span>
              </Link>
              <Link href="/admin/calendar" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/calendar.png" alt="Calendar" className="w-5 h-5 shrink-0 object-contain" />
                <span>Calendar</span>
              </Link>

              <div className="mt-4 text-xs text-gray-400">Academics</div>
              <Link href="/admin/academics/departments" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/department.png" alt="Departments" className="w-5 h-5 shrink-0 object-contain" />
                <span>Departments</span>
              </Link>
              <Link href="/admin/academics/classes" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/classes.png" alt="Classes" className="w-5 h-5 shrink-0 object-contain" />
                <span>Classes</span>
              </Link>
              <Link href="/admin/academics/subjects" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/subjects.png" alt="Subjects" className="w-5 h-5 shrink-0 object-contain" />
                <span>Subjects</span>
              </Link>
              <Link href="/admin/academics/sessions" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white">
                <img src="/images/icons/sessions.png" alt="Sessions" className="w-5 h-5 shrink-0 object-contain" />
                <span>Sessions</span>
              </Link>

              <div className="mt-auto pt-6">
                <form action="/api/auth/signout" method="POST" className="w-full">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-full bg-[#1e3a8a] hover:bg-blue-700 text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            </nav>
          </aside>

          <main className="p-3 md:p-6 bg-white/0">{children}</main>
        </div>
      </div>
    </div>
  );
}
