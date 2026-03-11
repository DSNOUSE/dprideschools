'use client';

import Link from 'next/link';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';

const actions = [
  {
    href: '/admin/academics/grades',
    icon: MenuBookOutlined,
    title: 'Grade Management',
    description: 'Enter and manage student grades for different subjects and terms',
    cta: 'Enter Grades',
  },
  {
    href: '/admin/students',
    icon: GroupOutlined,
    title: 'Student Management',
    description: 'View and manage student information, class assignments, and records',
    cta: 'Manage Students',
  },
  {
    href: '/results',
    icon: AssessmentOutlined,
    title: 'View Results',
    description: 'Check student results and performance analytics',
    cta: 'View Results',
  },
  {
    href: '/admin/calendar',
    icon: CalendarTodayOutlined,
    title: 'Academic Calendar',
    description: 'View academic calendar, exam schedules, and important dates',
    cta: 'View Calendar',
  },
  {
    href: '/admin/notifications',
    icon: NotificationsOutlined,
    title: 'Notifications',
    description: 'Send notifications to parents and students',
    cta: 'Send Notices',
  },
  {
    href: '/admin/my-classes',
    icon: SchoolOutlined,
    title: 'My Classes',
    description: 'View your assigned classes and subjects',
    cta: 'My Classes',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h2>
        <p className="text-xs sm:text-sm text-gray-500">Common tasks and tools</p>
      </div>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="p-4 sm:p-5 lg:p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="flex-shrink-0">
                    <action.icon className="text-blue-900" sx={{ fontSize: { xs: 28, sm: 32, lg: 36 } }} />
                  </div>
                  <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {action.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium">
                  {action.cta}
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
