import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createTerm, deleteTerm } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TermsPage() {
  // Check authentication at the page level
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles as string[] | undefined;
  
  if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
    redirect('/admin-signin');
  }
  const terms = await prisma.term.findMany({ orderBy: { id: 'asc' } });
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Terms</h1>
          <p className="text-gray-600">Create and manage academic terms.</p>
        </div>
        <form action={createTerm} className="flex gap-2">
          <input name="name" placeholder="Term name (e.g., Term 1)" className="border rounded px-3 py-2" />
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
            {terms.map((t: { id: number; name: string }) => (
              <tr key={t.id}>
                <td className="p-2 border">{t.id}</td>
                <td className="p-2 border">{t.name}</td>
                <td className="p-2 border text-center">
                  <form action={deleteTerm.bind(null, t.id)}>
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
