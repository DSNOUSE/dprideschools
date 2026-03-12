import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { checkResultSchema } from '@/lib/results/schema';
import { rateLimiter } from '@/lib/results/rate-limiter';
import { getStudentResult } from '@/lib/results/service';

export const dynamic = 'force-dynamic';

/** Extract the real client IP from proxy headers. */
function extractIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may be "client, proxy1, proxy2" — take the first
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/** Build a consistent JSON error envelope. */
function errorJson(status: number, error: string, code: string, details?: unknown) {
  return NextResponse.json(
    { error, code, timestamp: new Date().toISOString(), ...(details ? { details } : {}) },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    // ── Environment check ─────────────────────────────────────
    if (!process.env.DATABASE_URL) {
      return errorJson(503, 'Database not available', 'DB_UNAVAILABLE');
    }

    // ── Parse JSON ────────────────────────────────────────────
    let rawBody: unknown;
    try {
      const text = await request.text();
      rawBody = JSON.parse(text);
    } catch {
      return errorJson(400, 'Invalid JSON in request body', 'INVALID_JSON');
    }

    // ── Schema validation (Zod) ───────────────────────────────
    const parsed = checkResultSchema.safeParse(rawBody);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return errorJson(400, 'Validation failed', 'VALIDATION_ERROR', details);
    }

    // ── Rate limit ────────────────────────────────────────────
    const ip = extractIp(request);
    if (!rateLimiter.check(ip)) {
      return errorJson(429, 'Too many requests. Please try again later.', 'RATE_LIMITED');
    }

    // ── Delegate to service layer ─────────────────────────────
    const result = await getStudentResult(parsed.data);
    return NextResponse.json(result);

  } catch (err: unknown) {
    // Service layer throws { status, error, code } for expected errors
    if (typeof err === 'object' && err !== null && 'status' in err && 'error' in err) {
      const e = err as { status: number; error: string; code?: string };
      return errorJson(e.status, e.error, e.code || 'ERROR');
    }

    logger.error('Unexpected error in results check', err);
    return errorJson(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}
