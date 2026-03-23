'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import { WarningAmber, Print, EmojiEvents, TrendingUp, Assessment, Star } from '@mui/icons-material';
import { checkResult, calculateGrade, getGradeColor } from '@/lib/results';
import type { ResultData } from '@/lib/results';

export default function StudentResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  // Get student admission number from URL or session
  const studentAdmissionNo = searchParams?.get('student') || (session?.user as any)?.admissionNo;

  const queryClassId = searchParams?.get('class') || undefined;
  const querySessionId = searchParams?.get('session') || undefined;
  const queryTermId = searchParams?.get('term') || undefined;

  // Grade calculation functions imported from @/lib/results

  // Fetch available terms
  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/academics/terms');
      const data = await response.json();
      if (Array.isArray(data)) {
        setTerms(data);
        // Set default term to first term if none selected
        if (!selectedTerm && data.length > 0) {
          setSelectedTerm(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  // Fetch student results
  const fetchStudentResults = async (admissionNo: string) => {
    try {
      setLoading(true);
      setError('');

      const res = await checkResult({
        studentId: admissionNo,
        classId: queryClassId,
        sessionId: querySessionId,
        termId: selectedTerm || queryTermId,
      });

      if (res.ok) {
        setResult(res.data);
        setError('');
      } else {
        setError(res.error);
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
  };

  // Auto-fetch results if student admission number is available
  useEffect(() => {
    if (studentAdmissionNo) {
      fetchStudentResults(studentAdmissionNo);
    }
  }, [studentAdmissionNo, selectedTerm]);

  // Fetch terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  // Set initial selected term from URL params
  useEffect(() => {
    if (queryTermId && !selectedTerm) {
      setSelectedTerm(queryTermId);
    }
  }, [queryTermId, selectedTerm]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'authenticated' && !studentAdmissionNo) {
      router.push('/results');
    }
  }, [status, studentAdmissionNo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Results Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => studentAdmissionNo && fetchStudentResults(studentAdmissionNo)}
              variant="blue-pill"
            >
              Retry
            </Button>
            <Button
              onClick={handleLogout}
              variant="red-pill"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 md:py-4 gap-4">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{result.student.firstName} {result.student.lastName}'s Results</h1>
            
            {/* Term Selector */}
            {terms.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="term-select" className="text-sm font-medium text-gray-700">
                  Select Term:
                </label>
                <select
                  id="term-select"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {terms.map((term) => (
                    <option key={term.id} value={term.id.toString()}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="py-4 md:py-8">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 min-w-0">
        {/* Student Information */}
        <div className="space-y-4 md:space-y-6 mb-6 border-2 border-blue-200 p-3 md:p-4 rounded-lg bg-blue-50">
          {/* Mobile: Side-by-side layout | Desktop: Existing layout */}
          <div className="flex items-center space-x-4">
            {result.student.photo ? (
              <img
                src={result.student.photo}
                alt={`${result.student.firstName} ${result.student.lastName}`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={result.student.sex === 'M' ? '/images/pp-result-boy.png' : '/images/pp-result-girl.png'}
                  alt={`${result.student.firstName} ${result.student.lastName}`}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {result.student.firstName} {result.student.lastName}
              </h3>
              <p className="text-sm text-gray-600">{result.student.admissionNo}</p>
              <p className="text-gray-600">Class: {result.class.name}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-gray-600">Session: {result.session.name}</p>
            <p className="text-gray-600">Term: {result.term.name}</p>
            <p className="text-gray-600">Sex: {result.student.sex || 'N/A'}</p>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-200">
          {result.result ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Academic Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <EmojiEvents sx={{ fontSize: 28, color: '#2563eb', marginBottom: 1 }} />
                  <p className="text-xs text-gray-600 mb-1">Position</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">{result.result.position || '-'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <TrendingUp sx={{ fontSize: 28, color: '#16a34a', marginBottom: 1 }} />
                  <p className="text-xs text-gray-600 mb-1">Average</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">{result.result.average?.toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <Assessment sx={{ fontSize: 28, color: '#9333ea', marginBottom: 1 }} />
                  <p className="text-xs text-gray-600 mb-1">Total</p>
                  <p className="text-lg md:text-2xl font-bold text-purple-600">{result.result.totalScore?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <Star sx={{ fontSize: 28, color: '#ea580c', marginBottom: 1 }} />
                  <p className="text-xs text-gray-600 mb-1">Max Score</p>
                  <p className="text-lg md:text-2xl font-bold text-orange-600">{result.result.maxScore || 0}</p>
                </div>
              </div>
              {/* Performance Indicator */}
              <div className="mt-4 bg-white rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">Overall Performance</div>
                <div className="flex items-center justify-center mt-2">
                  {result.result.average >= 80 ? (
                    <div className="flex items-center text-green-600 font-bold">
                      <Star sx={{ fontSize: 20, marginRight: 1 }} />
                      Excellent
                    </div>
                  ) : result.result.average >= 70 ? (
                    <div className="flex items-center text-blue-600 font-bold">
                      <TrendingUp sx={{ fontSize: 20, marginRight: 1 }} />
                      Good
                    </div>
                  ) : result.result.average >= 60 ? (
                    <div className="flex items-center text-orange-600 font-bold">
                      <Assessment sx={{ fontSize: 20, marginRight: 1 }} />
                      Satisfactory
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 font-bold">
                      <WarningAmber sx={{ fontSize: 20, marginRight: 1 }} />
                      Needs Improvement
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">No results available yet for this term/session</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later or contact your teacher</p>
            </div>
          )}
        </div>

        {/* Teacher's Comment */}
        {result.result?.comment && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 mb-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Teacher's Comment
            </h3>
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <p className="text-gray-700 leading-relaxed">{result.result.comment}</p>
            </div>
          </div>
        )}

        {/* Subject Grades */}
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {result.grades.map((grade, index) => {
            const letterGrade = calculateGrade(grade.average);
            const gradeColor = getGradeColor(letterGrade);
            return (
              <div key={`${grade.subjectId}-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header with Subject */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-base">{grade.subject.name}</h3>
                  <div className="text-xs text-gray-500 mt-1">Subject Performance</div>
                </div>
                
                {/* Scores Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-blue-600 text-xs font-medium mb-1">1st</div>
                    <div className="text-blue-900 font-bold text-lg">{grade.firstScore}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-green-600 text-xs font-medium mb-1">2nd</div>
                    <div className="text-green-900 font-bold text-lg">{grade.secondScore}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-purple-600 text-xs font-medium mb-1">Exam</div>
                    <div className="text-purple-900 font-bold text-lg">{grade.examScore}</div>
                  </div>
                </div>
                
                {/* Average Section */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-gray-600 text-xs mb-1">Overall Average</div>
                    <div className="text-gray-900 font-bold text-xl">{grade.average.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">1st Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">2nd Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Exam Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Average</th>
                </tr>
              </thead>
              <tbody>
                {result.grades.map((grade, index) => {
                  const letterGrade = calculateGrade(grade.average);
                  const gradeColor = getGradeColor(letterGrade);
                  return (
                    <tr key={`${grade.subjectId}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{grade.subject.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{grade.firstScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{grade.secondScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{grade.examScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-bold">{grade.average.toFixed(1)}</td>
                    </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 print:hidden">
          <Button
            onClick={handlePrint}
            variant="blue-pill"
            className="flex items-center w-full sm:w-auto"
          >
            <Print sx={{ fontSize: 18, marginRight: 1 }} />
            Print Results
          </Button>
          <Button
            onClick={handleLogout}
            variant="red-pill"
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:bg-white {
              background-color: white !important;
            }
            .print\\:text-black {
              color: black !important;
            }
            .print\\:border-black {
              border-color: black !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:rounded-none {
              border-radius: 0 !important;
            }
          }
        `}</style>
            </div>

            {/* Right Sidebar */}
            <div className="w-full flex-shrink-0 lg:w-80">
              {/* School Event Calendar */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  School Calendar
                </h3>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-sm text-gray-600">March 2026</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="font-semibold text-gray-600 p-1">{day}</div>
                    ))}
                    {Array.from({length: 31}, (_, i) => i + 1).map((date) => (
                      <div
                        key={date}
                        className={`p-1 rounded ${
                          date === 15
                            ? 'bg-blue-600 text-white font-bold'
                            : date < 15
                              ? 'text-gray-400'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {date}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span className="font-semibold text-gray-900">Graduation Ceremony</span>
                    </div>
                    <div className="text-sm text-gray-600">July 15, 2026 • 10:00 AM</div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-semibold text-gray-900">Final Exams</span>
                    </div>
                    <div className="text-sm text-gray-600">June 20-25, 2026</div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-semibold text-gray-900">Sports Day</span>
                    </div>
                    <div className="text-sm text-gray-600">May 30, 2026 • 9:00 AM</div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-semibold text-gray-900">Art Exhibition</span>
                    </div>
                    <div className="text-sm text-gray-600">April 25, 2026 • 2:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
