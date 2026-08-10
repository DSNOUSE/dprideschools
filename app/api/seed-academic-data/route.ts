import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Legacy seed endpoint disabled after academic schema v2.
 * Use scripts/seed-*.js or prisma seed flows instead.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'This seed endpoint is disabled after the academic schema v2 migration. Use dedicated seed scripts.',
      code: 'SEED_DISABLED',
    },
    { status: 410 }
  );
}

export async function GET() {
  return POST();
}
