/**
 * Shared client helper for fetching results.
 *
 * Both `app/results/page.tsx` and `app/student-results/page.tsx` now
 * delegate to this module instead of duplicating fetch + error handling.
 */

import type { ResultData, ResultsErrorResponse } from './types';

export interface CheckResultParams {
  studentId: string;
  classId?: string;
  sessionId?: string;
  termId?: string;
}

export interface CheckResultSuccess {
  ok: true;
  data: ResultData;
}

export interface CheckResultError {
  ok: false;
  error: string;
  code?: string;
}

export type CheckResultResponse = CheckResultSuccess | CheckResultError;

/**
 * POST to `/api/results/check` and return a discriminated‑union result
 * so callers don't need to duplicate error handling.
 */
export async function checkResult(params: CheckResultParams): Promise<CheckResultResponse> {
  try {
    const response = await fetch('/api/results/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: params.studentId.trim().toUpperCase(),
        classId: params.classId,
        sessionId: params.sessionId,
        termId: params.termId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const err = data as ResultsErrorResponse;
      return { ok: false, error: err.error || 'Failed to fetch results', code: err.code };
    }

    if (!data || !data.student) {
      return { ok: false, error: 'No student data found in response' };
    }

    return { ok: true, data: data as ResultData };
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}
