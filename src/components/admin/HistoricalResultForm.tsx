// components/admin/HistoricalResultForm.tsx
//
// Manual one-off entry form for 2024/2025 results. Submits to
// POST /api/academics/historical-results (file 3).
//
// Assumes GET /api/academics/subjects returns [{ id, name }] — adjust
// the fetch path if your subjects endpoint lives elsewhere.

'use client';

import { useEffect, useState } from 'react';

const SESSION_ID = 4; // 2024/2025 — fixed for this form

const CLASSES = [
  { id: 2, name: 'DISCOVERY CLASS (Pre-Nursery)' },
  { id: 3, name: 'EXPLORERS (Nursery 1)' },
  { id: 4, name: 'PREPARATORY (Nursery 2)' },
  { id: 5, name: 'YEAR 1' },
  { id: 6, name: 'YEAR 2' },
  { id: 7, name: 'YEAR 3' },
  { id: 8, name: 'YEAR 4' },
  { id: 9, name: 'YEAR 5' },
  { id: 10, name: 'YEAR 6' },
  { id: 11, name: 'YEAR 7' },
  { id: 12, name: 'YEAR 8' },
  { id: 13, name: 'YEAR 9' },
];

const TERMS = [
  { id: 5, name: 'First Term' },
  { id: 6, name: 'Second Term' },
  { id: 7, name: 'Third Term' },
];

const ENROLLMENT_STATUSES = ['PROMOTED', 'REPEATED', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED'] as const;

type Subject = { id: number; name: string };

type FormState = {
  admissionNo: string;
  firstName: string;
  lastName: string;
  classId: string;
  termId: string;
  subjectId: string;
  ca1: string;
  ca2: string;
  exam: string;
  enrollmentStatus: string;
};

const initialState: FormState = {
  admissionNo: '',
  firstName: '',
  lastName: '',
  classId: '',
  termId: '',
  subjectId: '',
  ca1: '',
  ca2: '',
  exam: '',
  enrollmentStatus: '',
};

export default function HistoricalResultForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/academics/subjects')
      .then((res) => res.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/academics/historical-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNo: form.admissionNo,
          firstName: form.firstName,
          lastName: form.lastName,
          classId: Number(form.classId),
          sessionId: SESSION_ID,
          termId: Number(form.termId),
          subjectId: Number(form.subjectId),
          ca1: Number(form.ca1),
          ca2: Number(form.ca2),
          exam: Number(form.exam),
          enrollmentStatus: form.enrollmentStatus || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save result.' });
      } else {
        setMessage({ type: 'success', text: `Saved. Result recorded for ${form.admissionNo}.` });
        // Keep student/class/term selected for faster repeated entry across subjects
        setForm((prev) => ({ ...prev, subjectId: '', ca1: '', ca2: '', exam: '' }));
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error — please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Add 2024/2025 Result</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Admission Number</label>
          <input
            required
            value={form.admissionNo}
            onChange={(e) => update('admissionNo', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="ADM/2021/001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Enrollment Status (if left)</label>
          <select
            value={form.enrollmentStatus}
            onChange={(e) => update('enrollmentStatus', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Leave blank if still enrolled</option>
            {ENROLLMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            required
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            required
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Names are only used if this admission number doesn&apos;t already exist in the system.
        Existing students keep their current name.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Class (2024/2025)</label>
          <select
            required
            value={form.classId}
            onChange={(e) => update('classId', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select class</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Term</label>
          <select
            required
            value={form.termId}
            onChange={(e) => update('termId', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select term</option>
            {TERMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Subject</label>
        <select
          required
          value={form.subjectId}
          onChange={(e) => update('subjectId', e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">CA1 (max 10)</label>
          <input
            required
            type="number"
            min={0}
            max={10}
            step="0.5"
            value={form.ca1}
            onChange={(e) => update('ca1', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">CA2 (max 10)</label>
          <input
            required
            type="number"
            min={0}
            max={10}
            step="0.5"
            value={form.ca2}
            onChange={(e) => update('ca2', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Exam (max 80)</label>
          <input
            required
            type="number"
            min={0}
            max={80}
            step="0.5"
            value={form.exam}
            onChange={(e) => update('exam', e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {message && (
        <p className={message.type === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save Result'}
      </button>
    </form>
  );
}
