import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionIdParam = searchParams.get('sessionId');

    let sessionId = sessionIdParam ? parseInt(sessionIdParam) : null;
    if (!sessionId) {
      const active = await prisma.session.findFirst({ where: { isActive: true }, orderBy: { id: 'desc' } });
      sessionId = active?.id ?? null;
    }

    if (classId && sessionId) {
      const offerings = await prisma.subjectOffering.findMany({
        where: {
          classId: parseInt(classId),
          sessionId,
          isActive: true,
        },
        include: {
          subject: true,
          class: { include: { level: true } },
        },
        orderBy: { subject: { name: 'asc' } },
      });

      return NextResponse.json(
        offerings.map((o) => ({
          ...o.subject,
          classId: o.classId,
          section: o.class.level.section,
          class: o.class,
          department: {
            id: o.class.level.id,
            name: o.class.level.section.replaceAll('_', ' '),
          },
          offeringId: o.id,
          isCompulsory: o.isCompulsory,
        }))
      );
    }

    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
