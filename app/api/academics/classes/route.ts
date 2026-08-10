import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const classes = await prisma.class.findMany({
      include: { level: true },
      orderBy: [{ level: { section: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    // Keep legacy-friendly fields used by existing UI
    const payload = classes.map((c) => ({
      ...c,
      sort_order: c.sortOrder,
      departmentId: null,
      levelName: c.level.name,
      section: c.level.section,
      department: {
        id: c.level.id,
        name: c.level.section.replaceAll('_', ' '),
      },
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
