import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, message, recipientType, classId, priority } = await request.json();

  let parents: Array<{ id: string; email: string }> = [];
  if (recipientType === 'ALL_PARENTS') {
    parents = await prisma.parent.findMany({ select: { id: true, email: true } });
  } else if (recipientType === 'CLASS_PARENTS') {
    parents = await prisma.parent.findMany({
      where: {
        students: {
          some: {
            student: {
              enrollments: {
                some: {
                  classId: Number(classId),
                  status: 'ACTIVE',
                },
              },
            },
          },
        },
      },
      select: { id: true, email: true },
    });
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      type: 'ANNOUNCEMENT',
      recipientType,
      classId: classId ? Number(classId) : null,
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
