"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type Props = { params: Promise<{ id: string }> };

// Student data shape based on usage in component
interface StudentEnrollment {
  sessionId?: string | null;
  session?: {
    id: string;
  };
}

interface StudentData {
  enrollments: StudentEnrollment[];
}

export default function StudentView({ params }: Props) {
  const { id } = React.use(params);

  const [sessionId, setSessionId] = useState<number | undefined>();
  const [reports, setReports] = useState<unknown[]>([]);
  const [terms, setTerms] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      try {
        // Student and reports are independent, so fetch in parallel
        const [studentRes, reportsRes] = await Promise.all([
          fetch(`/api/academics/students/${id}`, { signal }),
          fetch(`/api/reports?studentId=${id}`, { signal }),
        ]);

        if (!studentRes.ok) {
          setError(studentRes.status === 404 ? 'not-found' : 'failed');
          return;
        }

        const studentData = await studentRes.json();

        const sid =
          studentData.enrollments?.[0]?.sessionId ??
          studentData.enrollments?.[0]?.session?.id;
        setSessionId(sid);

        if (reportsRes.ok) setReports(await reportsRes.json());

        // Terms depend on the student's session
        const termsRes = await fetch(
          sid ? `/api/academics/terms?sessionId=${sid}` : '/api/academics/terms',
          { signal }
        );
        if (termsRes.ok) setTerms(await termsRes.json());
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error fetching data:', err);
          setError('failed');
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  // ...rest of component
}