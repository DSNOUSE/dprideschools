import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;
  if (!roles?.includes('Administrator')) {
    redirect('/signin');
  }
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r p-4 space-y-2">
        <h2 className="font-semibold">Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin">Dashboard</Link>
          <span className="text-sm text-gray-500 mt-2">Academics</span>
          <Link href="/admin/academics/departments">Departments</Link>
          <Link href="/admin/academics/terms">Terms</Link>
          <Link href="/admin/academics/classes">Classes</Link>
          <Link href="/admin/academics/subjects">Subjects</Link>
          <Link href="/admin/academics/sessions">Sessions</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
