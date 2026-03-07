import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, message, recipientType, classId, departmentId, priority } = await request.json();

  let parents: Array<any> = [];
  if (recipientType === 'ALL_PARENTS') {
    parents = await prisma.parent.findMany();
  } else if (recipientType === 'CLASS_PARENTS') {
    parents = await prisma.parent.findMany({
      where: { students: { some: { student: { classId: Number(classId) } } } },
    });
  } else if (recipientType === 'DEPARTMENT_PARENTS') {
    parents = await prisma.parent.findMany({
      where: { students: { some: { student: { class: { departmentId: Number(departmentId) } } } } },
    });
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      type: 'ANNOUNCEMENT',
      recipientType,
      classId: classId ? Number(classId) : null,
      departmentId: departmentId ? Number(departmentId) : null,
      senderId: (session.user as any).id,
      priority: (priority as any) ?? 'NORMAL',
      recipients: {
        create: parents.map((p) => ({ parentId: p.id })),
      },
    },
  });

  for (const parent of parents) {
    try {
      await sendEmail({
        to: parent.email,
        subject: title,
        text: message,
      });
    } catch (err) {
      console.error('Email send failed for', parent.email, err);
    }
  }

  return NextResponse.json(notification);
}
