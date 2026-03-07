'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
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
                  <Search sx={{ fontSize: 20 }} />
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
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Results Dashboard</h1>
            <p className="text-gray-600 mt-1">Academic Performance Overview</p>
          </div>
        </div>

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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp sx={{ fontSize: 24, color: '#2563eb' }} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{result.result.average.toFixed(1)}</span>
            </div>
            <p className="text-gray-600 text-sm">Overall Average</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-700 text-xl font-bold">
                ★
              </div>
              <span className="text-2xl font-bold text-gray-900">{result.result.totalScore}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Score</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-800 text-xl font-bold">
                Σ
              </div>
              <span className="text-2xl font-bold text-gray-900">{result.result.maxScore}</span>
            </div>
            <p className="text-gray-600 text-sm">Max Score</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-700 text-xl font-bold">
                #
              </div>
              <span className="text-2xl font-bold text-gray-900">{result.result.position || '-'}</span>
            </div>
            <p className="text-gray-600 text-sm">Class Position</p>
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
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Logout
          </button>

          <Button
            onClick={() => setResult(null)}
            className="px-8 py-3 bg-white/80 backdrop-blur-md border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Check Another Result
          </Button>
        </div>
      </Container>
    </div>
  );
}
