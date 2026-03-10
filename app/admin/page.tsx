'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import UserMenu from '@/components/admin/UserMenu';

export default function AdminHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-signin');
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="hidden sm:flex w-9 h-9 rounded-full bg-blue-900 items-center justify-center text-white font-bold flex-shrink-0">
                D
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">Teacher Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center ml-2 flex-shrink-0">
              <UserMenu userName={userName} userRole={isAdmin ? 'Administrator' : isTeacher ? 'Teacher' : 'Staff'} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MenuBookOutlined className="text-blue-900" sx={{ fontSize: { xs: 32, sm: 36, lg: 40 } }} />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Grade Entry</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">Quick Access</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GroupOutlined className="text-blue-900" sx={{ fontSize: { xs: 32, sm: 36, lg: 40 } }} />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Students</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">Manage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AssessmentOutlined className="text-blue-900" sx={{ fontSize: { xs: 32, sm: 36, lg: 40 } }} />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Results</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">Analytics</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NotificationsOutlined className="text-blue-900" sx={{ fontSize: { xs: 32, sm: 36, lg: 40 } }} />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Notices</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">Send</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-gray-500">Common tasks and tools</p>
          </div>
          
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Grade Management */}
              <Link href="/admin/academics/grades" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <MenuBookOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Grade Management
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Enter and manage student grades for different subjects and terms
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                    Enter Grades
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Student Management */}
              <Link href="/admin/students" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <GroupOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Student Management
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    View and manage student information, class assignments, and records
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                    Manage Students
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* View Results */}
              <Link href="/results" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <AssessmentOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      View Results
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Check student results and performance analytics
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                    View Results
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Calendar */}
              <Link href="/admin/calendar" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <CalendarTodayOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Academic Calendar
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    View academic calendar, exam schedules, and important dates
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                    View Calendar
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Notifications */}
              <Link href="/admin/notifications" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <NotificationsOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Notifications
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Send notifications to parents and students
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                    Send Notices
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* My Classes */}
              <Link href="/admin/my-classes" className="group">
                <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <SchoolOutlined className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      My Classes
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    View your assigned classes and subjects
                  </p>
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
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
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Activity</h2>
            <p className="text-xs sm:text-sm text-gray-500">Your recent actions and updates</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <TrendingUpOutlined className="text-blue-900" sx={{ fontSize: { xs: 48, sm: 56, lg: 64 } }} />
              <p className="text-sm sm:text-base mt-4">No recent activity to display</p>
              <p className="text-xs sm:text-sm mt-2">Your actions will appear here as you use the system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
