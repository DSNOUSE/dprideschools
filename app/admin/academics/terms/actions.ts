"use server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function ensureAdmin(roles?: string[]) {
  if (!roles?.includes('Administrator')) throw new Error('Unauthorized');
}

export async function createTerm(formData: FormData) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);
  const name = (formData.get('name') || '').toString().trim();
  if (!name) throw new Error('Name is required');
  await prisma.term.create({ data: { name } });
  revalidatePath('/admin/academics/terms');
}

export async function deleteTerm(id: number) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);
  await prisma.term.delete({ where: { id } });
  revalidatePath('/admin/academics/terms');
}
