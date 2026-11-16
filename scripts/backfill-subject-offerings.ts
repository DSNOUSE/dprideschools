// scripts/backfill-subject-offerings.ts
//
// One-off data repair: copy subject offerings from a source session into
// one or more past sessions that have none.
//
// Dry run by default. Nothing is written without --apply.
//
// Usage:
//   npx tsx scripts/backfill-subject-offerings.ts --from 2 --to 1,4
//   npx tsx scripts/backfill-subject-offerings.ts --from 2 --to 1,4 --apply
//
// Requires `tsx` (npm i -D tsx) and DATABASE_URL in the environment.
//
// CAVEAT: this assumes the curriculum in the target sessions matched the
// source session. If subjects changed between years, review the dry-run
// output per class before applying.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { copySubjectOfferings } from '../src/lib/academics/service';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const fromRaw = arg('from');
  const toRaw = arg('to');

  if (!fromRaw || !toRaw) {
    console.error('Usage: --from <sessionId> --to <id[,id...]> [--apply]');
    process.exit(1);
  }

  const fromSessionId = parseInt(fromRaw, 10);
  const targets = toRaw.split(',').map((s) => parseInt(s.trim(), 10));
  if ([fromSessionId, ...targets].some(Number.isNaN)) {
    console.error('Session ids must be numbers.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new (await import('@prisma/adapter-pg')).PrismaPg(new (await import('pg')).Pool({ connectionString: process.env.DATABASE_URL })),
  });
  console.log(apply ? '*** APPLY MODE: writing to database ***' : '--- DRY RUN: no changes will be written ---');

  try {
    for (const toSessionId of targets) {
      const run = (dryRun: boolean) =>
        apply && !dryRun
          ? prisma.$transaction(
              (tx) => copySubjectOfferings(tx, { fromSessionId, toSessionId, dryRun: false }),
              { timeout: 60_000, maxWait: 10_000 }
            )
          : copySubjectOfferings(prisma, { fromSessionId, toSessionId, dryRun: true });

      const result = await run(!apply);

      console.log(`\nSession ${fromSessionId} -> ${toSessionId}`);
      console.log(`  source offerings:   ${result.sourceCount}`);
      console.log(`  ${apply ? 'created' : 'would create'}:       ${result.created}`);
      console.log(`  already present:    ${result.skippedExisting}`);
      for (const c of result.perClass) {
        console.log(`    class ${c.classId}: +${c.created} (existing ${c.skippedExisting})`);
      }
      if (result.sourceCount === 0) {
        console.warn(`  WARNING: source session ${fromSessionId} has no active offerings.`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});