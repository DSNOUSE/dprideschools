'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import UserMenu from '@/components/admin/UserMenu';

interface GradeEntry {
  studentId: string;
  subjectId: number;
  firstScore?: number;
  secondScore?: number;
  examScore?: number;
  average?: number;
}

interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface Subject {
  id: number;
  name: string;
  maxScore: number;
  displayName?: string;
}

export default function GradeManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const STUDENTS_PER_PAGE = 3;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSession && selectedTerm) {
      console.log('Dependencies met for fetching students and subjects:', { selectedClass, selectedSession, selectedTerm });
      fetchStudents();
      fetchSubjects();
      setCurrentPage(1);
    } else {
      console.log('Dependencies NOT met for fetching students and subjects:', { selectedClass, selectedSession, selectedTerm });
    }
  }, [selectedClass, selectedSession, selectedTerm]);

  useEffect(() => {
    if (selectedSubject) {
      setCurrentPage(1);
      fetchExistingGrades();
    }
  }, [selectedSubject]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to mobile card section
    const mobileSection = document.querySelector('[data-mobile-grades]');
    if (mobileSection) {
      mobileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  const fetchStudents = async () => {
    try {
      console.log('Fetching students for class:', selectedClass, 'session:', selectedSession);
      const response = await fetch(
        `/api/academics/students?classId=${selectedClass}&sessionId=${selectedSession}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students:', data);
        setStudents(data);
      } else {
        console.error('Failed to fetch students, response not ok:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const [subjectsRes, departmentsRes] = await Promise.all([
        fetch(`/api/academics/subjects?classId=${selectedClass}`),
        fetch('/api/academics/departments')
      ]);
      
      if (subjectsRes.ok && departmentsRes.ok) {
        const subjects = await subjectsRes.json();
        const departments = await departmentsRes.json();

        // Create department lookup map with abbreviations
        const departmentMap: Record<string | number, string> = {};
        const abbreviations: Record<string, string> = {
          Primary: 'Pri',
          Secondary: 'Sec',
          'Early Years': 'EY',
        };

        departments.forEach((dept: { id: string | number; name: string }) => {
          const abbrev =
            abbreviations[dept.name] || (dept.name ? dept.name.substring(0, 3) : '');
          departmentMap[dept.id] = abbrev;
        });

        // Enhance subjects with department abbreviations
        const enhancedSubjects: Subject[] = subjects.map((subject: any) => ({
          ...subject,
          displayName: `${subject.name} (${
            departmentMap[subject.departmentId] ?? ''
          })`,
        }));

        setSubjects(enhancedSubjects);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchExistingGrades = async () => {
    if (!selectedSubject) {
      console.log('fetchExistingGrades skipped: No subject selected.');
      return;
    }

    setLoading(true);
    console.log('Attempting to fetch existing grades for:', { selectedClass, selectedSession, selectedTerm, selectedSubject });
    try {
      const response = await fetch(
        `/api/academics/grades?classId=${selectedClass}&sessionId=${selectedSession}&termId=${selectedTerm}&subjectId=${selectedSubject}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched existing grades:', data);
        const existingGrades = data.map((grade: any) => ({
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          firstScore: grade.firstScore || undefined,
          secondScore: grade.secondScore || undefined,
          examScore: grade.fourthScore || undefined,
        }));

        // Merge with existing grades
        const mergedGrades = students.map(student => {
          const existing = existingGrades.find((g: GradeEntry) => g.studentId === student.id);
          return existing || {
            studentId: student.id,
            subjectId: parseInt(selectedSubject),
            firstScore: undefined,
            secondScore: undefined,
            examScore: undefined,
          };
        });

        setGrades(mergedGrades);
      } else {
        console.error('Failed to fetch existing grades, response not ok:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch existing grades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject && students.length > 0) {
      fetchExistingGrades();
    }
  }, [selectedSubject, students]);

  const handleGradeChange = (studentId: string, field: keyof GradeEntry, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    
    setGrades(prev => prev.map(grade => {
      if (grade.studentId === studentId) {
        const updated = { ...grade, [field]: numValue };
        
        // Calculate average if all scores are present
        if (updated.firstScore !== undefined && 
            updated.secondScore !== undefined && 
            updated.examScore !== undefined) {
          const scores = [updated.firstScore, updated.secondScore, updated.examScore];
          updated.average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        }
        
        return updated;
      }
      return grade;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/academics/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: parseInt(selectedClass),
          sessionId: parseInt(selectedSession),
          termId: parseInt(selectedTerm),
          grades: grades.filter(grade => 
            grade.firstScore !== undefined || 
            grade.secondScore !== undefined || 
            grade.examScore !== undefined
          )
        })
      });

      if (response.ok) {
        setMessage('Grades saved successfully!');
        // Refresh grades
        await fetchExistingGrades();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save grades');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
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
    return null; // Will redirect
  }

  return (
    <Container className="py-12">
      {/* Header with Sign Out */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-sm text-gray-600 mt-1">Enter and manage student grades for different subjects and terms</p>
        </div>
        <div className="flex-shrink-0">
          <UserMenu 
            userName={session?.user?.name || 'User'} 
            userRole={(session?.user as any)?.roles?.includes('Administrator') ? 'Administrator' : 'Teacher'} 
          />
        </div>
      </div>

      {/* Selection Form */}
      <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-lg border mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Session</option>
              {sessions.map((sess: any) => (
                <option key={sess.id} value={sess.id}>{sess.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Term</option>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.displayName} (Max: {subject.maxScore})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 sm:p-4 rounded text-xs sm:text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Grade Entry Table */}
      {selectedSubject && students.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border">
          <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold">Grade Entry</h3>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="text-sm sm:text-base"
            >
              {saving ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">Loading grades...</div>
          ) : (
            <>
              {/* Mobile Card Layout with Pagination */}
              <div className="sm:hidden" data-mobile-grades>
                <div className="p-3 space-y-4">
                  {(() => {
                    const startIdx = (currentPage - 1) * STUDENTS_PER_PAGE;
                    const endIdx = startIdx + STUDENTS_PER_PAGE;
                    const paginatedStudents = students.slice(startIdx, endIdx);
                    const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);

                    return (
                      <>
                        {paginatedStudents.map((student) => {
                          const grade = grades.find(g => g.studentId === student.id);
                          const average = grade?.average || 0;
                          
                          return (
                            <div key={student.id} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Admission No</p>
                                  <p className="text-sm font-semibold text-gray-900">{student.admissionNo}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Student Name</p>
                                  <p className="text-sm text-gray-900 truncate">{student.firstName} {student.middleName} {student.lastName}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">1st Score</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={grade?.firstScore || ''}
                                    onChange={(e) => handleGradeChange(student.id, 'firstScore', e.target.value)}
                                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">2nd Score</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={grade?.secondScore || ''}
                                    onChange={(e) => handleGradeChange(student.id, 'secondScore', e.target.value)}
                                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">Exam Score</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={grade?.examScore || ''}
                                  onChange={(e) => handleGradeChange(student.id, 'examScore', e.target.value)}
                                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </div>

                              <div className="bg-blue-50 rounded p-2 text-center">
                                <p className="text-xs text-gray-600 mb-1">Average</p>
                                <p className="text-lg font-bold text-blue-900">{average > 0 ? average.toFixed(1) : '-'}</p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-300 gap-2">
                            <Button
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              variant="blue"
                              size="sm"
                            >
                              ← Prev
                            </Button>
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded">
                              {currentPage} / {totalPages}
                            </span>
                            <Button
                              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              variant="blue"
                              size="sm"
                            >
                              Next →
                            </Button>
                          </div>
                        )}

                        {/* Show page info for single page too */}
                        {totalPages === 1 && students.length > 0 && (
                          <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                            Showing all {students.length} student{students.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2 sm:p-3 whitespace-nowrap">Admission No</th>
                      <th className="text-left p-2 sm:p-3 min-w-[150px]">Student Name</th>
                      <th className="text-center p-2 sm:p-3 whitespace-nowrap">1st Score</th>
                      <th className="text-center p-2 sm:p-3 whitespace-nowrap">2nd Score</th>
                      <th className="text-center p-2 sm:p-3 whitespace-nowrap">Exam Score</th>
                      <th className="text-center p-2 sm:p-3 whitespace-nowrap">Average</th>
                    </tr>
                  </thead>
                <tbody>
                  {students.map((student) => {
                    const grade = grades.find(g => g.studentId === student.id);
                    const average = grade?.average || 0;
                    
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{student.admissionNo}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm truncate">
                          {student.firstName} {student.middleName} {student.lastName}
                        </td>
                        <td className="p-2 sm:p-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.firstScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'firstScore', e.target.value)}
                            className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 sm:p-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.secondScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'secondScore', e.target.value)}
                            className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 sm:p-3 hidden sm:table-cell">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.examScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'examScore', e.target.value)}
                            className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 sm:p-3 text-center font-medium text-xs sm:text-sm">
                          {average > 0 ? average.toFixed(1) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      )}
    </Container>
  );
}
