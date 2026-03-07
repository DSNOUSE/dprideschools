'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;
  const roles = (session.user as any)?.roles || [];
  const userName = session.user?.name || 'User';

  const isAdmin = userRole === 'Administrator' || roles.includes('Administrator');
  const isTeacher = userRole === 'Teacher' || roles.includes('Teacher');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold mr-2">
                D
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {isAdmin ? 'Administrator' : isTeacher ? 'Teacher' : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-900 text-xl font-bold">
                📘
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grade Entry</p>
                <p className="text-2xl font-semibold text-gray-900">Quick Access</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg text-green-700 text-xl font-bold">
                👥
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">Manage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-700 text-xl font-bold">
                📊
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Results</p>
                <p className="text-2xl font-semibold text-gray-900">Analytics</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg text-orange-700 text-xl font-bold">
                🔔
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notices</p>
                <p className="text-2xl font-semibold text-gray-900">Send</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Common tasks and tools</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grade Management */}
              <Link href="/admin/academics/grades" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl">
                      📘
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Grade Management
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter and manage student grades for different subjects and terms
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    Enter Grades
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Student Management */}
              <Link href="/admin/students" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-xl">
                      👥
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-green-600">
                      Student Management
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    View and manage student information, class assignments, and records
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Manage Students
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* View Results */}
              <Link href="/results" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 text-xl">
                      📊
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-purple-600">
                      View Results
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Check student results and performance analytics
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    View Results
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Calendar */}
              <Link href="/admin/calendar" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl">📅</span>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-orange-600">
                      Academic Calendar
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    View academic calendar, exam schedules, and important dates
                  </p>
                  <div className="flex items-center text-orange-600 text-sm font-medium">
                    View Calendar
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Notifications */}
              <Link href="/admin/notifications" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-red-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl">🔔</span>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-red-600">
                      Notifications
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Send notifications to parents and students
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    Send Notices
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* My Classes */}
              <Link href="/admin/my-classes" className="group">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl">🏫</span>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-teal-600">
                      My Classes
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    View your assigned classes and subjects
                  </p>
                  <div className="flex items-center text-teal-600 text-sm font-medium">
                    My Classes
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Your recent actions and updates</p>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <span className="text-5xl">📈</span>
              <p>No recent activity to display</p>
              <p className="text-sm mt-2">Your actions will appear here as you use the system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
