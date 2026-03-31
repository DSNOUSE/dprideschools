'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { 
  Person, 
  Edit, 
  Save, 
  Cancel,
  Search,
  Email,
  Badge,
  Add,
  Close
} from '@mui/icons-material';

interface Teacher {
  id: string;
  email: string;
  name?: string;
  teacherId?: string;
  roles: string[];
  createdAt: string;
  lastLogin?: string;
}

export default function TeacherManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ teacherId: string }>({ teacherId: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    name: '',
    teacherId: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher.id);
    setEditForm({ teacherId: teacher.teacherId || '' });
  };

  const handleSave = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: editForm.teacherId || null
        }),
      });

      if (response.ok) {
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        setError('Failed to update teacher');
      }
    } catch (err) {
      setError('Failed to update teacher');
    }
  };

  const handleCancel = () => {
    setEditingTeacher(null);
    setEditForm({ teacherId: '' });
  };

  const handleAddTeacher = async () => {
    // Validation
    if (!addForm.email || !addForm.password) {
      setError('Email and password are required');
      return;
    }

    if (addForm.password !== addForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (addForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: addForm.email,
          name: addForm.name || null,
          teacherId: addForm.teacherId || null,
          password: addForm.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddForm(false);
        setAddForm({
          email: '',
          name: '',
          teacherId: '',
          password: '',
          confirmPassword: ''
        });
        setError('');
        fetchTeachers();
      } else {
        setError(data.error || 'Failed to add teacher');
      }
    } catch (err) {
      setError('Failed to add teacher');
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddForm({
      email: '',
      name: '',
      teacherId: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
    <>
      {/* Add Teacher Modal - Outside Container */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Teacher</h2>
              <button
                onClick={handleCancelAdd}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="teacher@school.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={addForm.teacherId}
                  onChange={(e) => setAddForm({ ...addForm, teacherId: e.target.value })}
                  placeholder="EMP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={addForm.confirmPassword}
                  onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTeacher}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Teacher
              </button>
              <button
                onClick={handleCancelAdd}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Container>
        <div className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <Person className="w-8 h-8 text-blue-600" />
              Teacher Management
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Add className="w-5 h-5" />
              Add Teacher
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search teachers by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Teachers Table */}
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold">Teachers ({filteredTeachers.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher Information
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Person className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{teacher.name || 'Not set'}</div>
                            <div className="text-gray-500 flex items-center gap-1">
                              <Email className="w-3 h-3" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingTeacher === teacher.id ? (
                          <input
                            type="text"
                            value={editForm.teacherId}
                            onChange={(e) => setEditForm({ teacherId: e.target.value })}
                            placeholder="Enter Employee ID"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {teacher.teacherId ? (
                              <>
                                <Badge className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{teacher.teacherId}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {teacher.roles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingTeacher === teacher.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(teacher.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              title="Cancel"
                            >
                              <Cancel className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTeachers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No teachers found matching your search.' : 'No teachers found.'}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
