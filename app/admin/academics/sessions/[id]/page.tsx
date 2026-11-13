'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';

interface SessionData {
  id: number;
  name: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  studentCount: number;
  classCount: number;
  subjectCount: number;
  termCount: number;
}

interface ClassData {
  id: number;
  name: string;
  levelName: string;
  section: string;
  studentCount: number;
  subjectCount: number;
}

interface StudentData {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  className: string;
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'classes'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    })();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const sessionId = parseInt(resolvedParams.id);

        // Fetch session overview
        const sessionRes = await fetch(`/api/academics/sessions?id=${sessionId}`);
        if (!sessionRes.ok) throw new Error('Failed to fetch session');
        const sessionDataResponse = await sessionRes.json();
        
        // Find the session with matching ID
        const session = Array.isArray(sessionDataResponse)
          ? sessionDataResponse.find((s: any) => s.id === sessionId)
          : sessionDataResponse;

        if (!session) {
          setError('Session not found');
          return;
        }

        // Fetch classes for this session
        let classesData: any[] = [];
        const classesRes = await fetch(`/api/academics/classes?sessionId=${sessionId}`);
        if (classesRes.ok) {
          classesData = await classesRes.json();
          setClasses(classesData);
        }

        // Fetch students for this session
        let studentsData: any[] = [];
        const studentsRes = await fetch(`/api/academics/students?sessionId=${sessionId}`);
        if (studentsRes.ok) {
          studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        setSessionData({
          ...session,
          studentCount: studentsData?.length || 0,
          classCount: classesData?.length || 0,
          subjectCount: 0, // Will be calculated from offerings
          termCount: session._count?.terms || 0,
        });

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [resolvedParams]);

  if (!resolvedParams) {
    return <div className="p-8">Loading...</div>;
  }

  const sessionId = parseInt(resolvedParams.id);

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href="/admin/academics/sessions" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Sessions
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading session data...</p>
          </div>
        ) : sessionData ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{sessionData.name}</h1>
                  <p className="text-gray-600 mt-2">
                    {sessionData.startDate && sessionData.endDate
                      ? `${new Date(sessionData.startDate).toLocaleDateString()} - ${new Date(sessionData.endDate).toLocaleDateString()}`
                      : 'No dates configured'}
                  </p>
                </div>
                {sessionData.isActive && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-full">
                    ACTIVE SESSION
                  </span>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl font-bold text-blue-600">{students.length}</div>
                <div className="text-gray-600 text-sm mt-2">Total Students</div>
                <Link
                  href={`/admin/academics/sessions/${sessionId}/students`}
                  className="text-blue-500 text-xs hover:underline mt-3 inline-block"
                >
                  View Students →
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl font-bold text-green-600">{classes.length}</div>
                <div className="text-gray-600 text-sm mt-2">Classes</div>
                <Link
                  href={`/admin/academics/sessions/${sessionId}/classes`}
                  className="text-blue-500 text-xs hover:underline mt-3 inline-block"
                >
                  View Classes →
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl font-bold text-purple-600">{sessionData.termCount}</div>
                <div className="text-gray-600 text-sm mt-2">Terms</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl font-bold text-orange-600">{sessionData.subjectCount}</div>
                <div className="text-gray-600 text-sm mt-2">Subject Offerings</div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Link
                href={`/admin/academics/sessions/${sessionId}/subjects`}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition-colors"
              >
                <h3 className="font-semibold text-purple-900 mb-1">Subject Enrollment</h3>
                <p className="text-sm text-purple-700">View all subjects by class and students</p>
              </Link>
              <Link
                href={`/admin/academics/sessions/${sessionId}/verification`}
                className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg p-4 transition-colors"
              >
                <h3 className="font-semibold text-cyan-900 mb-1">Data Verification</h3>
                <p className="text-sm text-cyan-700">Check data integrity and consistency</p>
              </Link>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Session Status</h3>
                <p className="text-sm text-gray-600">
                  {sessionData.isActive ? '✓ Active Session' : '○ Inactive Session'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'students'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Students ({students.length})
                </button>
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'classes'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Classes ({classes.length})
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Session Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Total Enrolled Students</p>
                        <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Number of Classes</p>
                        <p className="text-2xl font-bold text-green-600">{classes.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Number of Terms</p>
                        <p className="text-2xl font-bold text-purple-600">{sessionData.termCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <p className={`text-2xl font-bold ${sessionData.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                          {sessionData.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'students' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Enrolled Students ({students.length})</h3>
                    {students.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No students enrolled in this session</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-3 font-semibold text-gray-700">Admission No</th>
                              <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                              <th className="text-left p-3 font-semibold text-gray-700">Class</th>
                              <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.slice(0, 10).map((student) => (
                              <tr key={student.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{student.admissionNo}</td>
                                <td className="p-3">{student.lastName} {student.firstName}</td>
                                <td className="p-3">{student.className}</td>
                                <td className="p-3">
                                  <Link
                                    href={`/admin/students/${student.id}`}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {students.length > 10 && (
                          <p className="text-gray-500 text-sm mt-4 text-center">
                            Showing 10 of {students.length} students. <Link href={`/admin/academics/sessions/${sessionId}/students`} className="text-blue-600 hover:underline">View all →</Link>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'classes' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Classes ({classes.length})</h3>
                    {classes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No classes configured for this session</p>
                    ) : (
                      <div className="space-y-2">
                        {classes.map((cls) => (
                          <Link
                            key={cls.id}
                            href={`/admin/academics/classes/${cls.id}?sessionId=${sessionId}`}
                            className="block p-4 bg-gray-50 hover:bg-blue-50 rounded border hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{cls.name}</p>
                                <p className="text-sm text-gray-600">{cls.levelName}</p>
                              </div>
                              <div className="flex gap-4 text-sm">
                                <div className="text-center">
                                  <p className="font-bold text-blue-600">{cls.studentCount}</p>
                                  <p className="text-xs text-gray-500">Students</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-green-600">{cls.subjectCount}</p>
                                  <p className="text-xs text-gray-500">Subjects</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Session not found
          </div>
        )}
      </div>
    </Container>
  );
}
