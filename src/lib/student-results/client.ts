import type { StudentHistoryResponse } from './types';

export async function fetchStudentHistory(): Promise<StudentHistoryResponse> {
  const response = await fetch('/api/student-results/history', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch history');
  }

  return response.json();
}
