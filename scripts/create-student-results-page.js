const fs = require('fs');
const path = require('path');

const pageContent = `'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import { WarningAmber, Print, TrendingUp } from '@mui/icons-material';
import { fetchStudentHistory } from '@/lib/student-results/client';
import type { StudentHistoryResponse } from '@/lib/student-results/types';

export default function StudentResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<StudentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

  const studentAdmissionNo = searchParams?.get('student') || (session?.user as any)?.admissionNo;

  useEffect(() => {
    if (studentAdmissionNo && status === 'authenticated') {
      loadHistory();
    }
  }, [studentAdmissionNo, status]);

  useEffect(() => {
    if (status === 'authenticated' && !studentAdmissionNo) {
      router.push('/results');
    }
  }, [status, studentAdmissionNo, router]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchStudentHistory();
      setHistory(data);
      if (data.sessions.length > 0 && data.sessions[0].terms.length > 0) {
        setSelectedSessionId(data.sessions[0].session.id);
        setSelectedTermId(data.sessions[0].terms[0].term.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionToggle = (sessionId: number) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId); else next.add(sessionId);
      return next;
    });
  };

  const handleTermSelect = (sessionId: number, termId: number) => {
    setSelectedSessionId(sessionId);
    setSelectedTermId(termId);
  };

  const handlePrint = () => { window.print(); };
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading academic history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-600 text-5xl mb-4">
            <WarningAmber sx={{ fontSize: 48, color: '#dc2626' }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-2">
            <Button onClick={loadHistory} variant="blue-pill">Retry</Button>
            <Button onClick={handleLogout} variant="red-pill">Logout</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!history) return null;

  const currentTermData = history.sessions
    .find(s => s.session.id === selectedSessionId)
    ?.terms.find(t => t.term.id === selectedTermId);

  const allTerms = history.sessions.flatMap(s => s.terms);
  const totalTerms = allTerms.length;
  const overallAverage = allTerms.length > 0 ? allTerms.reduce((sum, t) => sum + (t.result?.average || 0), 0) / allTerms.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm print:hidden">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003366]">
                {history.student.firstName} {history.student.lastName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {history.student.admissionNo} • Academic History
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} variant="blue-pill" startIcon={<Print />}>Print Current</Button>
              <Button onClick={handleLogout} variant="red-pill">Logout</Button>
            </div>
          </div>
        </Container>
      </div>`;

      <Container className="py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Academic History
              </h2>

              {totalTerms > 0 && (
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Overall Average</p>
                    <p className="text-2xl font-bold text-blue-900">{overallAverage.toFixed(1)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Terms Completed</p>
                    <p className="text-2xl font-bold text-green-700">{totalTerms}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {history.sessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No academic history available</p>
                ) : (
                  history.sessions.map((sessionData) => (
                    <div key={sessionData.session.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleSessionToggle(sessionData.session.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSessions.has(sessionData.session.id) ? (
                            <span>▼</span>
                          ) : (
                            <span>▶</span>
                          )}
                          <span className="font-semibold text-sm text-gray-900">
                            {sessionData.session.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {sessionData.terms.length} {sessionData.terms.length === 1 ? 'term' : 'terms'}
                        </span>
                      </button>

                      {expandedSessions.has(sessionData.session.id) && (
                        <div className="border-t border-gray-200 bg-white">
                          {sessionData.terms.map((termData) => {
                            const isSelected = selectedTermId === termData.term.id;
                            const hasResult = termData.result !== null;

                            return (
                              <button
                                key={termData.term.id}
                                onClick={() => handleTermSelect(sessionData.session.id, termData.term.id)}
                                className={\`w-full text-left p-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors \${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}\`}
                              >
                                <div className="font-medium text-sm text-gray-900 mb-1">
                                  {termData.term.name}
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                  {termData.class.name}
                                </div>
                                {hasResult && termData.result && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">
                                      Avg: <span className="font-semibold">{termData.result.average.toFixed(1)}</span>
                                    </span>
                                    {termData.result.position && (
                                      <span className="text-gray-600">
                                        Pos: <span className="font-semibold">#{termData.result.position}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                                {!hasResult && (
                                  <div className="text-xs text-gray-400 italic">No results yet</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            {currentTermData ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {currentTermData.term.name} Results
                      </h2>
                      <p className="text-gray-600">
                        {currentTermData.class.name} • {history.sessions.find(s => s.session.id === selectedSessionId)?.session.name}
                      </p>
                    </div>
                    {currentTermData.result && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {currentTermData.result.average.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
                    )}
                  </div>

                  {currentTermData.result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">Position</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {currentTermData.result.position ? \`#\${currentTermData.result.position}\` : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">Total Score</p>
                        <p className="text-2xl font-bold text-green-900">
                          {currentTermData.result.totalScore.toFixed(0)}
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium mb-1">Max Score</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {currentTermData.result.maxScore.toFixed(0)}
                        </p>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-xs text-yellow-600 font-medium mb-1">Grade</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {currentTermData.result.average >= 80 ? 'A' : currentTermData.result.average >= 60 ? 'B' : currentTermData.result.average >= 50 ? 'C' : currentTermData.result.average >= 40 ? 'D' : 'F'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {currentTermData.grades.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Grades</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Average</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTermData.grades.map((grade, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">{grade.subject.name}</td>
                              <td className="py-3 px-4 text-sm text-center text-gray-700">
                                {grade.firstScore?.toFixed(0) ?? 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-center">
                                <span className="font-semibold text-blue-600">
                                  {grade.average.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={\`inline-block px-3 py-1 rounded-full text-sm font-bold border-2 \${getGradeColor(grade.grade)}\`}>
                                  {grade.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {currentTermData.result?.comment && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Teacher's Comment</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-gray-800 italic">"{currentTermData.result.comment}"</p>
                      {currentTermData.result.commentAuthor && (
                        <p className="text-sm text-gray-600 mt-2">
                          — {formatCommentAttribution(currentTermData.result.commentAuthor)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <TrendingUp sx={{ fontSize: 64, color: '#9ca3af', marginBottom: 16 }} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Term</h3>
                <p className="text-gray-600">Choose a term from the sidebar to view detailed results</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
`;

function getGradeColor(grade) {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-300';
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'F': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function formatCommentAttribution(author) {
  if (typeof author === 'string') return author;
  if (author && typeof author === 'object') {
    return author.name || author.firstName || 'Teacher';
  }
  return 'Teacher';
}

const outputPath = path.join(__dirname, '..', 'app', 'student-results', 'page.tsx');
fs.writeFileSync(outputPath, pageContent, 'utf8');
console.log('✓ Student results page created at:', outputPath);
console.log('✓ File size:', fs.statSync(outputPath).size, 'bytes');