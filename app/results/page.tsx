'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
interface ResultData {
  student: {
    admissionNo: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    sex?: string;
    photo?: string | null;
  };
  class: {
    name: string;
  };
  session: {
    name: string;
  };
  term: {
    name: string;
  };
  grades: {
    subject: { name: string };
    firstScore?: number;
    secondScore?: number;
    fourthScore?: number;
    average: number;
    gradeId?: number;
  }[];
  result: {
    position?: number;
    average: number;
    totalScore: number;
    maxScore: number;
    gradeId?: number;
    comment?: string;
  };
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState('');
  interface SelectOption {
    id: number;
    name: string;
  }

  const [classes, setClasses] = useState<SelectOption[]>([]);
  const [sessions, setSessions] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Auto-populate form if redirected from login
  useEffect(() => {
    const autoStudent = searchParams.get('student');
    const autoClass = searchParams.get('class');
    const autoSession = searchParams.get('session');
    const autoFlag = searchParams.get('auto');

    console.log('Auto-redirect params:', { autoStudent, autoClass, autoSession, autoFlag });

    if (autoStudent && autoFlag === 'true') {
      // Set the student ID
      setStudentId(autoStudent);
      
      if (autoClass && autoSession) {
        // If class and session are provided, set them directly
        setSelectedClass(autoClass);
        setSelectedSession(autoSession);
        console.log('Form values set with provided class/session');
      } else {
        // If only student is provided, fetch their class/session
        fetchStudentData(autoStudent);
      }
    }
  }, [searchParams]);

  // Fetch student data when only admission number is provided
  const fetchStudentData = async (admissionNo: string) => {
    try {
      console.log('Fetching student data for:', admissionNo);
      const response = await fetch('http://localhost:3000/api/academics/students');
      
      if (response.ok) {
        const allStudents = (await response.json()) as any[];
        const student = allStudents.find((s: any) => s.admissionNo === admissionNo);
        
        if (student) {
          console.log('Found student data:', student);
          setSelectedClass(student.classId.toString());
          setSelectedSession(student.sessionId.toString());
          console.log('Set class/session from student data');
        } else {
          console.log('Student not found in API');
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  // Auto-search when all data is ready
  useEffect(() => {
    const autoStudent = searchParams.get('student');
    const autoClass = searchParams.get('class');
    const autoSession = searchParams.get('session');
    const autoFlag = searchParams.get('auto');

    console.log('Auto-search check:', { 
      hasAutoFlag: autoFlag === 'true',
      hasStudent: !!autoStudent,
      hasClass: !!autoClass,
      hasSession: !!autoSession,
      hasTerms: terms.length > 0,
      hasFormValues: !!(studentId && selectedClass && selectedSession)
    });

    // For smart redirect: either we have all params OR we have student + fetched data + terms
    const shouldAutoSearch = autoFlag === 'true' && 
                          autoStudent && 
                          terms.length > 0 && 
                          studentId && 
                          selectedClass && 
                          selectedSession;

    if (shouldAutoSearch) {
      const termId = terms[0].id.toString();
      setSelectedTerm(termId);
      
      console.log('All conditions met, triggering auto-search NOW');
      
      // Auto-search immediately
      handleAutoSearch(autoStudent, selectedClass, selectedSession, termId);
    }
  }, [searchParams, terms, studentId, selectedClass, selectedSession]);

  const fetchDropdownData = async () => {
    try {
      const [classesRes, sessionsRes, termsRes] = await Promise.all([
        fetch('/api/academics/classes'),
        fetch('/api/academics/sessions'),
        fetch('/api/academics/terms')
      ]);

      if (classesRes.ok) setClasses(await classesRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (termsRes.ok) setTerms(await termsRes.json());
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedSession || !selectedTerm || !studentId) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/results/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          sessionId: selectedSession,
          termId: selectedTerm,
          studentId: studentId.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch results');
        setResult(null);
      } else {
        setResult(data);
        setError('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async (student: string, classId: string, sessionId: string, termId: string) => {
    console.log('Starting auto-search with:', { student, classId, sessionId, termId });
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/results/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classId,
          sessionId: sessionId,
          termId: termId,
          studentId: student.trim().toUpperCase()
        })
      });

      const data = await response.json();
      console.log('Auto-search response:', { status: response.status, data });

      if (!response.ok) {
        setError(data.error || 'Failed to fetch results');
        setResult(null);
      } else {
        setResult(data);
        setError('');
        console.log('Auto-search successful!');
      }
    } catch (err) {
      console.error('Auto-search error:', err);
      setError('Network error. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score: number): string => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  if (status === 'loading') {
    return (
      <Container className="py-12">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  if (!result) {
    return (
      <div className="min-h-screen">
        <Container className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Results Dashboard</h1>
            <p className="text-lg text-gray-600">Check academic performance and track progress</p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Search Results</h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select a Class</option>
                      {classes.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Session
                    </label>
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select a Session</option>
                      {sessions.map((sess: any) => (
                        <option key={sess.id} value={sess.id}>
                          {sess.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Term
                    </label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select a Term</option>
                      {terms.map((term: any) => (
                        <option key={term.id} value={term.id}>
                          {term.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID/Admission Number
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter student admission number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🔍</span>
                  {loading ? 'Searching...' : 'Search Result'}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen results-bg">
      <div className="py-8">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 min-w-0">

        {/* Student Info Card */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Student Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                {result.student.photo ? (
                  <img 
                    src={result.student.photo}
                    alt={`${result.student.firstName} ${result.student.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${result.student.firstName}+${result.student.lastName}&background=2563eb&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${result.student.firstName}+${result.student.lastName}&background=2563eb&color=fff&size=128`}
                    alt={`${result.student.firstName} ${result.student.lastName}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* Student Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {result.student.firstName} {result.student.middleName} {result.student.lastName}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Admission No:</span>
                  <span className="text-gray-900">{result.student.admissionNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Class:</span>
                  <span className="text-gray-900">{result.class.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Session:</span>
                  <span className="text-gray-900">{result.session.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Term:</span>
                  <span className="text-gray-900">{result.term.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Gender:</span>
                  <span className="text-gray-900">{result.student.sex || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 print:shadow-none print:rounded-none print:border-2 print:border-black print:bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2">
                <span className="text-lg text-blue-600">📈</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{result.result.average.toFixed(1)}</span>
              <p className="text-gray-600 text-xs mt-1">Overall Average</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 print:shadow-none print:rounded-none print:border-2 print:border-black print:bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-amber-100 rounded-lg mb-2 text-amber-700 text-lg font-bold">
                ★
              </div>
              <span className="text-xl font-bold text-gray-900">{result.result.totalScore}</span>
              <p className="text-gray-600 text-xs mt-1">Total Score</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 print:shadow-none print:rounded-none print:border-2 print:border-black print:bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2 text-blue-800 text-lg font-bold">
                Σ
              </div>
              <span className="text-xl font-bold text-gray-900">{result.result.maxScore}</span>
              <p className="text-gray-600 text-xs mt-1">Max Score</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 print:shadow-none print:rounded-none print:border-2 print:border-black print:bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-amber-100 rounded-lg mb-2 text-amber-700 text-lg font-bold">
                #
              </div>
              <span className="text-xl font-bold text-gray-900">{result.result.position || '-'}</span>
              <p className="text-gray-600 text-xs mt-1">Class Position</p>
            </div>
          </div>
        </div>

        {/* Subject Results + Teacher Comment (Two-column layout) */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: Subject Results (span 2 columns) */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject Results</h2>
              <div className="grid gap-4">
                {result.grades.map((grade, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white/70 hover:bg-white/80 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{grade.subject.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>1st: {grade.firstScore || '-'}</span>
                          <span>2nd: {grade.secondScore || '-'}</span>
                          <span>4th: {grade.fourthScore || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{grade.average.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Average</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(calculateGrade(grade.average))}`}>
                          {calculateGrade(grade.average)}
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(grade.average / result.result.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Teacher's Comment (placeholder) */}
            <aside className="md:col-span-1 bg-white/60 p-6 rounded-xl border border-white/20 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Teacher's Comment</h3>
              <div className="text-sm text-gray-700 mb-4 flex-1">
                {result.result.comment ? (
                  <p>{result.result.comment}</p>
                ) : (
                  <p className="text-gray-500">No comment yet. Comments added from the teacher's admin area will appear here.</p>
                )}
              </div>
              <div>
                <button disabled className="w-full px-4 py-2 border rounded-lg text-sm text-gray-600 bg-white/70">Open Teacher Panel</button>
              </div>
            </aside>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl print:hidden"
          >
            🖨️ Print Result
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl print:hidden"
          >
            Logout
          </button>

          <Button
            onClick={() => setResult(null)}
            className="px-8 py-3 bg-white/80 backdrop-blur-md border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl print:hidden"
          >
            Check Another Result
          </Button>
        </div>

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
