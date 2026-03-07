'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/Button';

interface Grade {
  subjectId: number;
  firstScore: number;
  secondScore: number;
  fourthScore: number;
  average: number;
  subject: { name: string };
  term: { name: string };
}

interface ResultData {
  student: {
    admissionNo: string;
    firstName: string;
    middleName: string;
    lastName: string;
    sex: string;
    classId: number;
    sessionId: number;
    photo?: string;
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
  grades: Grade[];
  result: {
    position: number;
    average: number;
    totalScore: number;
    maxScore: number;
  };
}

export default function StudentResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get student admission number from URL or session
  const studentAdmissionNo = searchParams.get('student') || (session?.user as any)?.admissionNo;

  // Class mapping based on admission number
  const studentClassMap: Record<string, string> = {
    // Nursery classes
    'DPS2024001': '1', 'DPS2024002': '1', 'DPS2024003': '1', 'DPS2024004': '1', 'DPS2024005': '1', 'DPS2024006': '1', 'DPS2024007': '1', 'DPS2024008': '1', 'DPS2024009': '1', 'DPS2024010': '1',
    
    // Primary classes
    'DPS2025001': '2', 'DPS2025002': '2', 'DPS2025003': '2', 'DPS2025004': '2', 'DPS2025005': '2', 'DPS2025006': '2', 'DPS2025007': '2', 'DPS2025008': '2', 'DPS2025009': '2', 'DPS2025010': '2',
    
    // Junior Secondary classes
    'DPS2026001': '3', 'DPS2026002': '3', 'DPS2026003': '3', 'DPS2026004': '3', 'DPS2026005': '3', 'DPS2026006': '3', 'DPS2026007': '3', 'DPS2026008': '3', 'DPS2026009': '3', 'DPS2026010': '3',
    
    // Senior Secondary classes
    'DPS2027001': '4', 'DPS2027002': '4', 'DPS2027003': '4', 'DPS2027004': '4', 'DPS2027005': '4', 'DPS2027006': '4', 'DPS2027007': '4', 'DPS2027008': '4', 'DPS2027009': '4', 'DPS2027010': '4',
    
    // Preparatory classes (Nursery 2)
    'DPS2026011': '4', 'DPS2026012': '4',
    
    // Class 6 (YEAR 2)
    'DPS2026015': '6',
        
    // Class 7 (YEAR 3)
    'DPS2026016': '7', 'DPS2026017': '7', 'DPS2026018': '7', 'DPS2026019': '7',
        
    // Class 8 (YEAR 4)
    'DPS2026020': '8', 'DPS2026021': '8', 'DPS2026022': '8', 'DPS2026023': '8', 'DPS2026024': '8', 'DPS2026025': '8', 'DPS2026026': '8', 'DPS2026027': '8',
        
    // Class 9 (YEAR 5)
    'DPS2026028': '9', 'DPS2026029': '9',
        
    // Class 11 (YEAR 7)
    'DPS2026030': '11', 'DPS2026031': '11',
        
    // Class 12 (YEAR 8)
    'DPS2026032': '12', 'DPS2026033': '12', 'DPS2026034': '12', 'DPS2026035': '12', 'DPS2026036': '12',
        
    // Class 13 (YEAR 9)
    'DPS2026037': '13',
  };

  // Grade calculation functions
  const calculateGrade = (average: number): string => {
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    if (average >= 50) return 'E';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'E': return 'text-red-600';
      case 'F': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  // Fetch student results
  const fetchStudentResults = async (admissionNo: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Use mapped classId if available, otherwise default to 1
      const classId = studentClassMap[admissionNo] || '1';
      
      console.log(`Student ${admissionNo} mapped to classId ${classId}`);
      
      const requestBody = {
        classId: classId,
        sessionId: '1',
        termId: '1',
        studentId: admissionNo.trim().toUpperCase()
      };
      
      console.log('Sending request with body:', requestBody);
      
      const response = await fetch('/api/results/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('Response not ok:', data.error || 'Failed to fetch results');
        setError(data.error || 'Failed to fetch results');
        setResult(null);
      } else if (!data || !data.student) {
        console.error('No student data in response:', data);
        setError('No student data found in response');
        setResult(null);
      } else {
        console.log('Setting result:', data);
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
  }, [studentAdmissionNo]);

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
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
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
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{result.student.firstName} {result.student.lastName}'s Results</h1>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Student Information */}
        <div className="space-y-6 mb-6 border-2 border-blue-200 p-4 rounded-lg bg-blue-50">
          <div className="flex items-center space-x-4">
            {result.student.photo ? (
              <img
                src={result.student.photo}
                alt={`${result.student.firstName} ${result.student.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src={result.student.sex === 'M' ? '/images/pp-result-boy.png' : '/images/pp-result-girl.png'}
                  alt={`${result.student.firstName} ${result.student.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
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
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="text-2xl font-bold text-blue-600">{result.result.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-blue-600">{result.result.average}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-2xl font-bold text-blue-600">{result.result.totalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Score</p>
                <p className="text-2xl font-bold text-blue-600">{result.result.maxScore}</p>
              </div>
            </div>
          </div>

        {/* Subject Grades */}
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">1st Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">2nd Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">4th Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Average</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
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
                      <td className="border border-gray-300 px-4 py-2 text-center">{grade.fourthScore}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-bold">{grade.average.toFixed(1)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${gradeColor}`}>
                          {letterGrade}
                        </span>
                      </td>
                    </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8 print:hidden">
          <Button
            onClick={handlePrint}
            variant="blue-pill"
            className="flex items-center"
          >
            🖨️ Print
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
