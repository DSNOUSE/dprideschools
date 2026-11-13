"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function ensureAdmin(roles?: string[]) {
  if (!roles?.includes("Administrator") && !roles?.includes("Teacher")) {
    throw new Error("Unauthorized");
  }
}

export async function createTerm(formData: FormData) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);

  const name = (formData.get("name") || "").toString().trim();
  if (!name) throw new Error("Term name is required");

  const activeSession = await prisma.session.findFirst({
    where: { isActive: true },
    orderBy: { id: "desc" },
  });
  if (!activeSession) throw new Error("No active academic session configured");

  const maxOrder = await prisma.term.aggregate({
    where: { sessionId: activeSession.id },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const existing = await prisma.term.findFirst({
    where: { sessionId: activeSession.id, name },
  });
  if (existing) throw new Error("Term name already exists for this session");

  await prisma.term.create({
    data: { sessionId: activeSession.id, name, order },
  });

  revalidatePath("/admin/academics/terms");
}

export async function deleteTerm(id: number, _formData?: FormData) {
  const session = await getServerSession(authOptions);
  ensureAdmin((session?.user as any)?.roles);

  const hasReferences = await prisma.$transaction([
    prisma.subjectResult.count({ where: { termId: id } }),
    prisma.termResult.count({ where: { termId: id } }),
  ]);
  if (hasReferences[0] > 0 || hasReferences[1] > 0) {
    throw new Error(
      "Cannot delete term: it is associated with existing results",
    );
  }

  await prisma.term.delete({ where: { id } });
  revalidatePath("/admin/academics/terms");
}
