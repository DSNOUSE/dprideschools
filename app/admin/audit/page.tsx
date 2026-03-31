'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { 
  Timeline, 
  Visibility, 
  Security, 
  Assessment, 
  TrendingUp,
  Person,
  Schedule,
  FilterList,
  Download,
  Search
} from '@mui/icons-material';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: any;
  newValues: any;
  changedFields: string[];
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  teacherId?: string;
  teacherFullName?: string;
  ipAddress: string;
  userAgent?: string;
  classId?: number;
  studentId?: string;
  subjectId?: number;
  termId?: number;
  timestamp: string;
  source: string;
  batchId?: string;
  notes?: string;
  user?: { name: string; email: string };
  student?: { admissionNo: string; firstName: string; lastName: string };
  subject?: { name: string };
  class?: { name: string };
  term?: { name: string };
}

interface AuditStats {
  totalChanges: number;
  uniqueTeachers: number;
  gradeChanges: number;
  resultChanges: number;
  bulkOperations: number;
  recentActivity: any[];
  timeframe: string;
  startDate: string;
  endDate: string;
}

export default function AuditDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [entityType, setEntityType] = useState('');
  const [userId, setUserId] = useState('');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [timeframe]);

  useEffect(() => {
    if (page === 1) {
      fetchLogs();
    }
  }, [entityType, userId, classId, studentId, startDate, endDate]);

  useEffect(() => {
    if (page > 1) {
      fetchLogs();
    }
  }, [page]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/audit/stats?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch audit stats:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });

      if (entityType) params.append('entityType', entityType);
      if (userId) params.append('userId', userId);
      if (classId) params.append('classId', classId);
      if (studentId) params.append('studentId', studentId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch (err) {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'Grade': return <Assessment className="w-4 h-4" />;
      case 'Result': return <TrendingUp className="w-4 h-4" />;
      default: return <Visibility className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);
      if (userId) params.append('userId', userId);
      if (classId) params.append('classId', classId);
      if (studentId) params.append('studentId', studentId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '10000'); // Export all matching records

      const response = await fetch(`/api/admin/audit/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        const csv = convertToCSV(data.logs);
        downloadCSV(csv, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (err) {
      setError('Failed to export audit logs');
    }
  };

  const convertToCSV = (logs: AuditLog[]) => {
    const headers = [
      'Timestamp', 'Entity Type', 'Action', 'Teacher Name', 'Teacher ID', 'Teacher Email', 
      'Student', 'Class', 'Subject', 'Changed Fields', 'IP Address', 'Notes'
    ];
    
    const rows = logs.map(log => [
      formatDate(log.timestamp),
      log.entityType,
      log.action,
      log.teacherFullName || log.userName || '',
      log.teacherId || '',
      log.userEmail || '',
      log.student ? `${log.student.firstName} ${log.student.lastName}` : '',
      log.class?.name || '',
      log.subject?.name || '',
      log.changedFields.join(', '),
      log.ipAddress,
      log.notes || ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (status === 'loading' || loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            <Security className="w-8 h-8 text-blue-600" />
            Audit Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Changes</div>
                  <div className="text-2xl font-bold">{stats.totalChanges}</div>
                </div>
                <Timeline className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Active Teachers</div>
                  <div className="text-2xl font-bold">{stats.uniqueTeachers}</div>
                </div>
                <Person className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Grade Changes</div>
                  <div className="text-2xl font-bold">{stats.gradeChanges}</div>
                </div>
                <Assessment className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Result Changes</div>
                  <div className="text-2xl font-bold">{stats.resultChanges}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Bulk Operations</div>
                  <div className="text-2xl font-bold">{stats.bulkOperations}</div>
                </div>
                <Schedule className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded capitalize ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FilterList className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="Grade">Grade</option>
                <option value="Result">Result</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class ID</label>
              <input
                type="text"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="Class ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Student ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={() => {
                setEntityType('');
                setUserId('');
                setClassId('');
                setStudentId('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">Audit Logs</h3>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getEntityTypeIcon(log.entityType)}
                        <span>{log.entityType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{log.teacherFullName || log.userName || 'Unknown'}</div>
                        <div className="text-gray-500">
                          {log.teacherId ? `ID: ${log.teacherId}` : log.userEmail || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.student ? (
                        <div>
                          <div className="font-medium">{log.student.firstName} {log.student.lastName}</div>
                          <div className="text-gray-500">{log.student.admissionNo}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.class?.name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {logs.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching the current filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, logs.length)} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={logs.length < limit}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
