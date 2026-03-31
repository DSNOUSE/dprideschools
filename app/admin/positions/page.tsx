'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import { 
  Calculate, 
  Refresh, 
  TrendingUp, 
  People, 
  CheckCircle, 
  Warning,
  School,
  CalendarToday
} from '@mui/icons-material';

interface ClassPositionSummary {
  classId: number;
  className: string;
  departmentName: string;
  totalStudents: number;
  studentsWithPositions: number;
  studentsWithoutPositions: number;
  positionCalculationComplete: boolean;
  needsRecalculation: boolean;
}

interface PositionCalculationResult {
  classId: number;
  className: string;
  departmentName: string;
  studentsProcessed: number;
  positionsUpdated: number;
  status: 'success' | 'error';
  error?: string;
}

export default function PositionsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calculatingAll, setCalculatingAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [terms, setTerms] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassPositionSummary[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Fetch terms
  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/academics/terms');
      const data = await response.json();
      if (Array.isArray(data)) {
        setTerms(data);
        if (data.length > 0 && !selectedTerm) {
          setSelectedTerm(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/academics/sessions');
      const data = await response.json();
      if (Array.isArray(data)) {
        setSessions(data);
        if (data.length > 0 && !selectedSession) {
          const activeSession = data.find((s: any) => s.isActive);
          setSelectedSession((activeSession || data[0]).id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Fetch class position summaries
  const fetchClassSummaries = async () => {
    if (!selectedTerm || !selectedSession) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/positions/calculate-all?termId=${selectedTerm}&sessionId=${selectedSession}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setClassSummaries(data.summary || []);
      } else {
        setError(data.error || 'Failed to fetch position summaries');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate positions for a specific class
  const calculateClassPositions = async (classId: number) => {
    if (!selectedTerm || !selectedSession) return;

    try {
      setCalculating(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/positions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          termId: parseInt(selectedTerm),
          sessionId: parseInt(selectedSession),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Positions calculated successfully for ${data.className}. ${data.positionsUpdated} students processed.`);
        await fetchClassSummaries(); // Refresh summaries
      } else {
        setError(data.error || 'Failed to calculate positions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  // Calculate positions for all classes
  const calculateAllPositions = async () => {
    if (!selectedTerm || !selectedSession) return;

    try {
      setCalculatingAll(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/positions/calculate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termId: parseInt(selectedTerm),
          sessionId: parseInt(selectedSession),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successfulClasses = data.summary.successfulClasses;
        const totalStudents = data.summary.totalStudentsProcessed;
        setSuccess(
          `Batch calculation completed! ${successfulClasses} classes processed, ${totalStudents} students updated.`
        );
        await fetchClassSummaries(); // Refresh summaries
      } else {
        setError(data.error || 'Failed to calculate positions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setCalculatingAll(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const roles = (session?.user as any)?.roles as string[] | undefined;
      if (!roles?.includes('Administrator')) {
        router.push('/admin');
      }
    }
  }, [status, session, router]);

  // Fetch initial data
  useEffect(() => {
    fetchTerms();
    fetchSessions();
  }, []);

  // Fetch summaries when term/session changes
  useEffect(() => {
    if (selectedTerm && selectedSession) {
      fetchClassSummaries();
    }
  }, [selectedTerm, selectedSession]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading position data...</p>
        </div>
      </div>
    );
  }

  const roles = (session?.user as any)?.roles as string[] | undefined;
  if (!roles?.includes('Administrator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Warning sx={{ fontSize: 48, color: '#dc2626' }} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <TrendingUp sx={{ fontSize: 32, color: '#1e3a8a' }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Class Positions</h1>
                <p className="text-gray-600">Calculate and manage student class positions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <Container>
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Term Selector */}
              <div>
                <label htmlFor="term-select" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarToday sx={{ fontSize: 16, marginRight: 1, verticalAlign: 'middle' }} />
                  Term
                </label>
                <select
                  id="term-select"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {terms.map((term) => (
                    <option key={term.id} value={term.id.toString()}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Selector */}
              <div>
                <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-2">
                  <School sx={{ fontSize: 16, marginRight: 1, verticalAlign: 'middle' }} />
                  Academic Session
                </label>
                <select
                  id="session-select"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id.toString()}>
                      {session.name} {session.isActive && '(Active)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Calculate Button */}
              <div className="flex items-end">
                <Button
                  onClick={calculateAllPositions}
                  disabled={calculatingAll || !selectedTerm || !selectedSession}
                  variant="blue-pill"
                  className="w-full"
                >
                  {calculatingAll ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Calculating All...
                    </>
                  ) : (
                    <>
                      <Calculate sx={{ fontSize: 18, marginRight: 1 }} />
                      Calculate All Positions
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Warning sx={{ fontSize: 20, color: '#dc2626' }} />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ fontSize: 20, color: '#16a34a' }} />
                  <span className="text-green-800">{success}</span>
                </div>
              </div>
            )}
          </div>

          {/* Class List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <People sx={{ fontSize: 24 }} />
                Class Position Status
              </h2>
            </div>

            {classSummaries.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">
                  <People sx={{ fontSize: 48 }} />
                </div>
                <p className="text-gray-600">No classes found with results for this term/session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Students
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Positions Calculated
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classSummaries.map((classSummary) => (
                      <tr key={classSummary.classId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{classSummary.className}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{classSummary.departmentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-900">{classSummary.totalStudents}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-900">
                            {classSummary.studentsWithPositions}/{classSummary.totalStudents}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((classSummary.studentsWithPositions / classSummary.totalStudents) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {classSummary.positionCalculationComplete ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle sx={{ fontSize: 14, marginRight: 1 }} />
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Warning sx={{ fontSize: 14, marginRight: 1 }} />
                              Needs Calculation
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            onClick={() => calculateClassPositions(classSummary.classId)}
                            disabled={calculating}
                            variant="blue-pill"
                            size="sm"
                          >
                            {calculating && selectedClass === classSummary.classId ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Calculating...
                              </>
                            ) : (
                              <>
                                <Calculate sx={{ fontSize: 14, marginRight: 1 }} />
                                Calculate
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
