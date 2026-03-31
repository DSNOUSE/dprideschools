'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { 
  Person, 
  Schedule, 
  Assessment, 
  TrendingUp,
  AccessTime,
  FilterList,
  Download,
  Search,
  BarChart
} from '@mui/icons-material';

interface TeacherActivity {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  teacherId?: string;
  teacherFullName?: string;
  duration?: number;
  recordsAffected?: number;
  ipAddress: string;
  userAgent?: string;
  sessionId: string;
  classId?: number;
  termId?: number;
  sessionIdAcademic?: number;
  timestamp: string;
  user?: { name: string; email: string };
  class?: { name: string };
}

interface ActivityStats {
  totalActivities: number;
  uniqueTeachers: number;
  avgDuration: number;
  totalRecordsProcessed: number;
  topActions: Array<{ action: string; count: number }>;
  recentActivities: TeacherActivity[];
}

export default function TeacherActivityReport() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [classId, setClassId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  useEffect(() => {
    if (page === 1) {
      fetchActivities();
    }
  }, [userId, action, classId, startDate, endDate]);

  useEffect(() => {
    if (page > 1) {
      fetchActivities();
    }
  }, [page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });

      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (classId) params.append('classId', classId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit/teachers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs);
      } else {
        setError('Failed to fetch teacher activities');
      }
    } catch (err) {
      setError('Failed to fetch teacher activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from activities
      const response = await fetch('/api/admin/audit/teachers?limit=10000');
      if (response.ok) {
        const data = await response.json();
        const allActivities = data.logs;
        
        const uniqueTeachers = new Set(allActivities.map((a: TeacherActivity) => a.userId)).size;
        const avgDuration = allActivities
          .filter((a: TeacherActivity) => a.duration)
          .reduce((sum: number, a: TeacherActivity) => sum + (a.duration || 0), 0) / 
          allActivities.filter((a: TeacherActivity) => a.duration).length;
        
        const totalRecordsProcessed = allActivities
          .reduce((sum: number, a: TeacherActivity) => sum + (a.recordsAffected || 0), 0);

        const actionCounts = allActivities.reduce((acc: any, a: TeacherActivity) => {
          acc[a.action] = (acc[a.action] || 0) + 1;
          return acc;
        }, {});

        const topActions = Object.entries(actionCounts)
          .map(([action, count]) => ({ action, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalActivities: allActivities.length,
          uniqueTeachers,
          avgDuration: Math.round(avgDuration || 0),
          totalRecordsProcessed,
          topActions,
          recentActivities: allActivities.slice(0, 10)
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
        return 'text-blue-600 bg-blue-50';
      case 'GRADE_ENTRY':
        return 'text-green-600 bg-green-50';
      case 'BULK_UPLOAD':
        return 'text-purple-600 bg-purple-50';
      case 'EXPORT':
        return 'text-orange-600 bg-orange-50';
      case 'VIEW_REPORTS':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
        return <Person className="w-4 h-4" />;
      case 'GRADE_ENTRY':
        return <Assessment className="w-4 h-4" />;
      case 'BULK_UPLOAD':
        return <Schedule className="w-4 h-4" />;
      case 'EXPORT':
        return <Download className="w-4 h-4" />;
      case 'VIEW_REPORTS':
        return <BarChart className="w-4 h-4" />;
      default:
        return <AccessTime className="w-4 h-4" />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (classId) params.append('classId', classId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '10000');

      const response = await fetch(`/api/admin/audit/teachers?${params}`);
      if (response.ok) {
        const data = await response.json();
        const csv = convertToCSV(data.logs);
        downloadCSV(csv, `teacher-activity-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (err) {
      setError('Failed to export teacher activities');
    }
  };

  const convertToCSV = (activities: TeacherActivity[]) => {
    const headers = [
      'Timestamp', 'Teacher Name', 'Teacher ID', 'Teacher Email', 'Action', 'Resource Type',
      'Duration', 'Records Affected', 'IP Address', 'Class', 'Details'
    ];
    
    const rows = activities.map(activity => [
      formatDate(activity.timestamp),
      activity.teacherFullName || activity.user?.name || '',
      activity.teacherId || '',
      activity.user?.email || '',
      activity.action,
      activity.resourceType,
      formatDuration(activity.duration),
      activity.recordsAffected?.toString() || '',
      activity.ipAddress,
      activity.class?.name || '',
      activity.details ? JSON.stringify(activity.details) : ''
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
            <Person className="w-8 h-8 text-green-600" />
            Teacher Activity Report
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Activities</div>
                  <div className="text-2xl font-bold">{stats.totalActivities}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
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
                  <div className="text-sm text-gray-500">Avg Duration</div>
                  <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
                </div>
                <AccessTime className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Records Processed</div>
                  <div className="text-2xl font-bold">{stats.totalRecordsProcessed.toLocaleString()}</div>
                </div>
                <BarChart className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Top Actions */}
        {stats && stats.topActions.length > 0 && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-3">Top Actions</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topActions.map((item, index) => (
                <div
                  key={item.action}
                  className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {item.action} ({item.count})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FilterList className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Actions</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="GRADE_ENTRY">Grade Entry</option>
                <option value="BULK_UPLOAD">Bulk Upload</option>
                <option value="EXPORT">Export</option>
                <option value="VIEW_REPORTS">View Reports</option>
              </select>
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
              onClick={fetchActivities}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={() => {
                setUserId('');
                setAction('');
                setClassId('');
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

        {/* Activities Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">Teacher Activities</h3>
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
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(activity.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{activity.teacherFullName || activity.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500">
                          {activity.teacherId ? `ID: ${activity.teacherId}` : activity.user?.email || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getActionIcon(activity.action)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                          {activity.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.resourceType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDuration(activity.duration)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.recordsAffected || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.class?.name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {activities.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No teacher activities found matching the current filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {activities.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, activities.length)} results
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
                disabled={activities.length < limit}
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
