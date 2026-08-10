import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Compatibility endpoint: departments are now school sections via ClassLevel
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const levels = await prisma.classLevel.findMany({
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        name: true,
        section: true,
        code: true,
      },
    });

    // Collapse to one entry per section for old department dropdowns
    const bySection = new Map<string, { id: number; name: string }>();
    for (const level of levels) {
      if (!bySection.has(level.section)) {
        bySection.set(level.section, {
          id: level.id,
          name: level.section.replaceAll('_', ' '),
        });
      }
    }

    return NextResponse.json(Array.from(bySection.values()));
  } catch (error) {
    console.error('Error fetching departments/sections:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
