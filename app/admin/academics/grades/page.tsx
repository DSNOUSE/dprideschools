'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';

interface GradeEntry {
  studentId: string;
  subjectId: number;
  firstScore?: number;
  secondScore?: number;
  fourthScore?: number;
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
    } else {
      console.log('Dependencies NOT met for fetching students and subjects:', { selectedClass, selectedSession, selectedTerm });
    }
  }, [selectedClass, selectedSession, selectedTerm]);

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
          fourthScore: grade.fourthScore || undefined,
        }));

        // Merge with existing grades
        const mergedGrades = students.map(student => {
          const existing = existingGrades.find((g: GradeEntry) => g.studentId === student.id);
          return existing || {
            studentId: student.id,
            subjectId: parseInt(selectedSubject),
            firstScore: undefined,
            secondScore: undefined,
            fourthScore: undefined,
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
            updated.fourthScore !== undefined) {
          const scores = [updated.firstScore, updated.secondScore, updated.fourthScore];
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
            grade.fourthScore !== undefined
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
      <SectionHeader 
        title="Grade Management" 
        description="Enter and manage student grades for different subjects and terms"
      />

      {/* Selection Form */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg border mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Session</option>
              {sessions.map((sess: any) => (
                <option key={sess.id} value={sess.id}>{sess.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Term</option>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className={`mb-4 p-4 rounded ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Grade Entry Table */}
      {selectedSubject && students.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Grade Entry</h3>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">Loading grades...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Admission No</th>
                    <th className="text-left p-3">Student Name</th>
                    <th className="text-center p-3">1st Score</th>
                    <th className="text-center p-3">2nd Score</th>
                    <th className="text-center p-3">4th Score</th>
                    <th className="text-center p-3">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const grade = grades.find(g => g.studentId === student.id);
                    const average = grade?.average || 0;
                    
                    return (
                      <tr key={student.id} className="border-b">
                        <td className="p-3 font-medium">{student.admissionNo}</td>
                        <td className="p-3">
                          {student.firstName} {student.middleName} {student.lastName}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.firstScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'firstScore', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.secondScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'secondScore', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={grade?.fourthScore || ''}
                            onChange={(e) => handleGradeChange(student.id, 'fourthScore', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3 text-center font-medium">
                          {average > 0 ? average.toFixed(1) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
