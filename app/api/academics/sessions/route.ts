import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const createSessionSchema = z.object({
  name: z.string().regex(/^\d{4}\/\d{4}$/, 'Session name must be in format YYYY/YYYY'),
  isActive: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const sessions = await prisma.session.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isAuthorized =
      hasRole(session, 'Administrator', 'Admin') ||
      userRole === 'Admin' ||
      userRole === 'Administrator';

    if (!session || !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, isActive } = parsed.data;

    // Reject duplicates before hitting a DB constraint
    const existing = await prisma.session.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: `Session ${name} already exists`, sessionId: existing.id },
        { status: 409 }
      );
    }

    // Everything that touches isActive must be one transaction, or you can
    // end up with zero or two active sessions if something fails midway.
    const newSession = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.session.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.session.create({
        data: { name, isActive },
      });
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

