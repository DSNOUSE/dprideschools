import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionIdParam = searchParams.get('sessionId');
    const sessionId = sessionIdParam ? parseInt(sessionIdParam, 10) : NaN;
    const scoped = Number.isInteger(sessionId) && sessionId > 0;

    const terms = await prisma.term.findMany({
      where: scoped ? { sessionId } : undefined,
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 });
  }
}
