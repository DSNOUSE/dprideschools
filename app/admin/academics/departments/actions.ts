"use server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function ensureAdmin(roles?: string[]) {
  if (!roles?.includes('Administrator')) throw new Error('Unauthorized');
}

export async function createDepartment(formData: FormData) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);
  const name = (formData.get('name') || '').toString().trim();
  if (!name) throw new Error('Name is required');

  const upper = name.toUpperCase();
  const section = upper.includes('EARLY') ? 'EARLY_YEARS' : upper.includes('SECOND') ? 'SECONDARY' : 'PRIMARY';
  const maxOrder = await prisma.classLevel.aggregate({ where: { section: section as any }, _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;
  const code = `${section.slice(0, 2)}-${Date.now().toString().slice(-4)}`;

  await prisma.classLevel.create({
    data: { name, code, section: section as any, sortOrder },
  });
  revalidatePath('/admin/academics/departments');
}

export async function deleteDepartment(id: number) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);
  await prisma.classLevel.delete({ where: { id } });
  revalidatePath('/admin/academics/departments');
}
