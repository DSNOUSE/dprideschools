'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Container from '@/components/Container';

interface VerificationResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  count?: number;
}

interface VerificationReport {
  sessionId: number;
  sessionName: string;
  timestamp: string;
  results: {
    totalStudents: VerificationResult;
    totalClasses: VerificationResult;
    totalSubjects: VerificationResult;
    classEnrollments: VerificationResult;
    subjectEnrollments: VerificationResult;
    orphanedEnrollments: VerificationResult;
    missingClassAssignments: VerificationResult;
    dataIntegrity: VerificationResult;
  };
}

export default function SessionVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      const id = parseInt(p.id);
      setSessionId(id);
      runVerification(id);
    });
  }, [params]);

  const runVerification = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/verify-session/${id}`);
      if (!response.ok) {
        throw new Error('Failed to verify session');
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Verifying session data...</p>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !report) {
    return (
      <Container>
        <div className="py-8">
          <Link href="/admin/academics/sessions" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">
            ← Back to Sessions
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Failed to load verification report'}
          </div>
        </div>
      </Container>
    );
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-block px-3 py-1 text-xs font-semibold rounded';
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const countErrors = Object.values(report.results).filter((r) => r.status === 'error').length;
  const countWarnings = Object.values(report.results).filter((r) => r.status === 'warning').length;

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href={`/admin/academics/sessions/${sessionId}`} className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to {report.sessionName}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Verification</h1>
              <p className="text-gray-600 mt-2">{report.sessionName}</p>
            </div>
            <button
              onClick={() => runVerification(sessionId!)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-lg p-4 ${countErrors > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <h3 className={`font-semibold mb-2 ${countErrors > 0 ? 'text-red-900' : 'text-green-900'}`}>
              Errors Found
            </h3>
            <p className={`text-3xl font-bold ${countErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {countErrors}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${countWarnings > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <h3 className={`font-semibold mb-2 ${countWarnings > 0 ? 'text-yellow-900' : 'text-green-900'}`}>
              Warnings
            </h3>
            <p className={`text-3xl font-bold ${countWarnings > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {countWarnings}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Verification Time</h3>
            <p className="text-sm text-blue-600">
              {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(report.results).map(([key, result]) => (
            <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                </div>
                <span className={getStatusBadge(result.status)}>{result.status.toUpperCase()}</span>
              </div>
              <div className="p-6">
                <p className="text-gray-800 font-medium mb-2">{result.message}</p>
                {result.details && <p className="text-gray-600 text-sm mb-2">{result.details}</p>}
                {result.count !== undefined && (
                  <p className="text-lg font-bold text-blue-600">Count: {result.count}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Verification Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ All students should be enrolled in exactly one class per session</li>
            <li>✓ Each class should have at least one subject offering</li>
            <li>✓ No students should be orphaned (without class assignment)</li>
            <li>✓ All subjects should belong to active classes</li>
            <li>✓ Data integrity check ensures no cross-session contamination</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
