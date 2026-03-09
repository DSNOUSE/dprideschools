import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;
  if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
    redirect('/admin-signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-white/80 py-2 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-none md:rounded-2xl shadow-xl overflow-hidden border">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block border-r p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl font-bold text-emerald-700">S</div>
              <div>
                <div className="font-semibold">School</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
            <nav className="flex flex-col gap-3">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"/></svg>
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/messenger" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.31 0-2.548-.226-3.69-.642L3 21l1.642-4.31A8.962 8.962 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <span>Messenger</span>
              </Link>
              <Link href="/admin/calendar" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
                <span>Calendar</span>
              </Link>
              <div className="mt-4 text-xs text-gray-400">Academics</div>
              <Link href="/admin/academics/departments" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
                <span>Departments</span>
              </Link>
              <Link href="/admin/academics/classes" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                <span>Classes</span>
              </Link>
              <Link href="/admin/academics/subjects" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z"/></svg>
                <span>Subjects</span>
              </Link>
              <Link href="/admin/academics/sessions" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
                <span>Sessions</span>
              </Link>
            </nav>
          </aside>
          <main className="p-3 md:p-6 bg-white/0">{children}</main>
        </div>
      </div>
    </div>
  );
}
