// src/lib/academics/service.ts
//
// Shared session-setup logic. Used by the backfill script now, and by the
// session setup endpoint later, so dry-run previews and real writes share
// one code path.
//
// The Prisma client is injected (not imported), so this file works with the
// global client, a $transaction client, or a script's own client.
//
// ASSUMPTIONS (verify against schema.prisma before using):
//  - Database supports createMany({ skipDuplicates }) (Postgres/MySQL; NOT SQLite).
//  - SubjectOffering fields: id, subjectId, classId, sessionId, isActive,
//    isCompulsory, with @@unique([subjectId, classId, sessionId]).
//    If it has other required fields without defaults (e.g. maxScore),
//    add them to the `data` mapping in copySubjectOfferings.
//  - Term fields: id, name, order, sessionId. If your order column has a
//    different name (e.g. `sequence`), change it in DEFAULT_TERMS and below.

import type { Prisma, PrismaClient } from '@prisma/client';

export type Db = PrismaClient | Prisma.TransactionClient;

const CHUNK_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------------
// Subject offerings
// ---------------------------------------------------------------------------

export interface CopyOfferingsOptions {
  fromSessionId: number;
  toSessionId: number;
  /** Limit to specific classes (e.g. per-class overrides from the wizard). */
  classIds?: number[];
  /** When true, nothing is written; the result shows what would happen. */
  dryRun?: boolean;
}

export interface CopyOfferingsResult {
  dryRun: boolean;
  fromSessionId: number;
  toSessionId: number;
  sourceCount: number;
  created: number;
  skippedExisting: number;
  perClass: { classId: number; created: number; skippedExisting: number }[];
}

export async function copySubjectOfferings(
  db: Db,
  opts: CopyOfferingsOptions
): Promise<CopyOfferingsResult> {
  const { fromSessionId, toSessionId, classIds, dryRun = false } = opts;

  if (fromSessionId === toSessionId) {
    throw new Error('Source and target session must be different.');
  }

  const [from, to] = await Promise.all([
    db.session.findUnique({ where: { id: fromSessionId } }),
    db.session.findUnique({ where: { id: toSessionId } }),
  ]);
  if (!from) throw new Error(`Source session ${fromSessionId} not found.`);
  if (!to) throw new Error(`Target session ${toSessionId} not found.`);

  const classFilter = classIds?.length ? { classId: { in: classIds } } : {};

  const source = await db.subjectOffering.findMany({
    where: { sessionId: fromSessionId, isActive: true, ...classFilter },
    select: { subjectId: true, classId: true, isCompulsory: true },
  });

  const existing = await db.subjectOffering.findMany({
    where: { sessionId: toSessionId, ...classFilter },
    select: { subjectId: true, classId: true },
  });
  const existingKeys = new Set(existing.map((e) => `${e.classId}:${e.subjectId}`));

  const toCreate = source.filter((s) => !existingKeys.has(`${s.classId}:${s.subjectId}`));

  const perClassMap = new Map<number, { created: number; skippedExisting: number }>();
  for (const s of source) {
    const row = perClassMap.get(s.classId) ?? { created: 0, skippedExisting: 0 };
    if (existingKeys.has(`${s.classId}:${s.subjectId}`)) row.skippedExisting++;
    else row.created++;
    perClassMap.set(s.classId, row);
  }

  if (!dryRun && toCreate.length > 0) {
    for (const batch of chunk(toCreate, CHUNK_SIZE)) {
      await db.subjectOffering.createMany({
        data: batch.map((s) => ({
          subjectId: s.subjectId,
          classId: s.classId,
          sessionId: toSessionId,
          isCompulsory: s.isCompulsory,
          isActive: true,
        })),
        skipDuplicates: true, // makes retries and double-clicks safe
      });
    }
  }

  return {
    dryRun,
    fromSessionId,
    toSessionId,
    sourceCount: source.length,
    created: toCreate.length,
    skippedExisting: source.length - toCreate.length,
    perClass: [...perClassMap.entries()]
      .map(([classId, v]) => ({ classId, ...v }))
      .sort((a, b) => a.classId - b.classId),
  };
}

// ---------------------------------------------------------------------------
// Terms
// ---------------------------------------------------------------------------

export interface TermInput {
  name: string;
  order: number;
}

export const DEFAULT_TERMS: TermInput[] = [
  { name: 'First Term', order: 1 },
  { name: 'Second Term', order: 2 },
  { name: 'Third Term', order: 3 },
];

export interface CreateTermsResult {
  dryRun: boolean;
  sessionId: number;
  created: TermInput[];
  skippedExisting: TermInput[];
}

export async function createDefaultTerms(
  db: Db,
  sessionId: number,
  opts: { terms?: TermInput[]; dryRun?: boolean } = {}
): Promise<CreateTermsResult> {
  const { terms = DEFAULT_TERMS, dryRun = false } = opts;

  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error(`Session ${sessionId} not found.`);

  const existing = await db.term.findMany({
    where: { sessionId },
    select: { name: true, order: true },
  });

  // Idempotent: skip any term whose order or name already exists.
  const isTaken = (t: TermInput) =>
    existing.some((e) => e.order === t.order || e.name === t.name);

  const created = terms.filter((t) => !isTaken(t));
  const skippedExisting = terms.filter(isTaken);

  if (!dryRun && created.length > 0) {
    await db.term.createMany({
      data: created.map((t) => ({ name: t.name, order: t.order, sessionId })),
    });
  }

  return { dryRun, sessionId, created, skippedExisting };
}