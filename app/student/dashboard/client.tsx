'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import { Print, Logout, Home } from '@mui/icons-material';
import {
  calculateGrade,
  getGradeColor,
} from '@/lib/results';
import type { Student, Session, Term } from '@prisma/client';
import type { ResultData } from '@/lib/results';

interface StudentDashboardClientProps {
  student: Student & {
    enrollments: any[];
  };
  sessions: Session[];
  activeSessionId: number;
  allTerms: Term[];
  activeTermId: number;
  initialResults: ResultData | null;
  studentName?: string;
}

export default function StudentDashboardClient({
  student,
  sessions,
  activeSessionId,
  allTerms,
  activeTermId,
  initialResults,
  studentName,
}: StudentDashboardClientProps) {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState(activeSessionId.toString());
  const [selectedTerm, setSelectedTerm] = useState(activeTermId.toString());
  const [results, setResults] = useState<ResultData | null>(initialResults);
  const [loading, setLoading] = useState(false);
  const [termsForSession, setTermsForSession] = useState(allTerms);

  // When session changes, fetch new terms and reset term selection
  useEffect(() => {
    const sessionId = parseInt(selectedSession);
    setLoading(true);

    // Fetch terms for selected session
    fetch(`/api/academics/terms?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        const terms = Array.isArray(data) ? data : [];
        setTermsForSession(terms);
        if (terms.length > 0) {
          setSelectedTerm(terms[terms.length - 1].id.toString());
        }
      })
      .catch((err) => {
        console.error('Error fetching terms:', err);
        setTermsForSession([]);
      })
      .finally(() => setLoading(false));
  }, [selectedSession]);

  // When term changes, fetch results
  useEffect(() => {
    if (!selectedTerm) return;

    setLoading(true);
    fetch('/api/results/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.admissionNo,
        classId: parseInt(selectedSession),
        sessionId: parseInt(selectedSession),
        termId: parseInt(selectedTerm),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error('API error:', data.error);
          setResults(null);
        } else {
          setResults(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching results:', err);
        setResults(null);
      })
      .finally(() => setLoading(false));
  }, [selectedTerm, selectedSession, student]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const currentSession = sessions.find((s) => s.id === parseInt(selectedSession));
  const currentTerm = termsForSession.find((t) => t.id === parseInt(selectedTerm));

  return (
    <div className="min-h-screen results-bg py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Results Dashboard</h1>
              <p className="text-gray-600 mt-2">Academic Performance & Records</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Print className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Logout className="w-4 h-4" />
                Logout
              </button>
              <button
                onClick={handleBackHome}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Admission Number</p>
                <p className="text-2xl font-bold text-gray-900">{student.admissionNo}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Class</p>
                <p className="text-lg font-semibold text-gray-900">
                  {student.enrollments[0]?.class?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Level</p>
                <p className="text-lg font-semibold text-gray-900">
                  {student.enrollments[0]?.class?.level?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session & Term Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Academic Period</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id.toString()}>
                    {session.name}
                    {session.isActive ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {termsForSession.length === 0 ? (
                  <option>No terms available</option>
                ) : (
                  termsForSession.map((term) => (
                    <option key={term.id} value={term.id.toString()}>
                      {term.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : results ? (
          <div className="space-y-8">
            {/* Subject Results */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Subject Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Subject</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Score</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Grade</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                        {results.grades.map((g, idx) => {
                          const score = g.average || 0;
                          const grade = calculateGrade(score);
                      const gradeColor = getGradeColor(grade);

                      return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-4 font-medium text-gray-900">{g.subject.name}</td>
                          <td className="p-4 text-center text-lg font-bold text-gray-900">
                                {score || '-'}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full font-bold text-white ${gradeColor}`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="p-4 text-center text-sm text-gray-600">
                                {score >= 80
                              ? 'Excellent'
                                  : score >= 70
                                ? 'Good'
                                    : score >= 60
                                  ? 'Satisfactory'
                                      : score >= 50
                                    ? 'Pass'
                                    : 'Needs Improvement'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Term Result Comments */}
            {results.result?.comment && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Teacher Comments</h3>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-gray-900 mb-2">{results.result.comment}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No results available for the selected period. Results will appear here once they are
              published.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Results shown are for: {currentSession?.name} - {currentTerm?.name}</p>
          <p className="mt-2">
            For inquiries about your results, please contact the administration office.
          </p>
        </div>
      </Container>

      <style jsx>{`
        @media print {
          button,
          select,
          .no-print {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
