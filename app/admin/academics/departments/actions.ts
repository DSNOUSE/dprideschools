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
  if (!prisma) throw new Error('Prisma client is not initialized');
  await prisma.department.create({ data: { name } });
  revalidatePath('/admin/academics/departments');
}

export async function deleteDepartment(id: number) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);
  if (!prisma) throw new Error('Prisma client is not initialized');
  await prisma.department.delete({ where: { id } });
  revalidatePath('/admin/academics/departments');
}
