'use client';

import React from 'react';
import { LinkButton } from './Button';
import type { CalendarEvent } from './SchoolCalendar';

const CurrentMonthEvents: React.FC = () => {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Sample current month events based on the calendar provided
  // These would typically come from an API or database
  const currentMonthEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'First Day of Term',
      date: '2025-09-02',
      type: 'academic',
      description: 'Students resume for the 2025-2026 academic year',
      time: '8:00 AM',
      location: 'School Premises',
    },
    {
      id: '2',
      title: 'Staff Development Day',
      date: '2025-09-01',
      type: 'meeting',
      description: 'Professional development for teaching staff',
      time: '9:00 AM',
      location: 'Conference Room',
    },
    {
      id: '3',
      title: 'Welcome Assembly',
      date: '2025-09-05',
      type: 'event',
      description: 'Welcome assembly for all students',
      time: '10:00 AM',
      location: 'School Hall',
    },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'academic':
        return '#7763E5'; // Purple for First Day of Term
      case 'holiday':
        return '#FF6D1c'; // Orange for Staff Development Day  
      case 'exam':
        return '#09a24f'; // Green for Welcome Assembly
      case 'event':
        return '#09a24f'; // Green for event
      case 'meeting':
        return '#FF6D1c'; // Orange for Staff Development Day
      default:
        return '#7763E5'; // Purple default
    }
  };

  const getEventBorderColor = (type: string) => {
    switch (type) {
      case 'academic':
      case 'holiday':
        return '#FF6D1c';
      case 'exam':
        return '#B54CCA';
      case 'event':
        return '#09a24f';
      default:
        return '#09a24f';
    }
  };

  const sortedEvents = [...currentMonthEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/images/title-img.svg" 
              alt="" 
              className="w-8 h-8"
              aria-hidden="true"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {currentMonth} Events
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with important dates and activities happening this month at DPRIDE International School
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-xl"
              style={{
                backgroundColor: getEventColor(event.type),
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-white text-lg font-bold">
                  {event.type === 'academic'
                    ? '📘'
                    : event.type === 'holiday'
                    ? '🌴'
                    : event.type === 'exam'
                    ? '📝'
                    : '📅'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-sm text-white">
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {event.time && <p>Time: {event.time}</p>}
                    {event.location && <p>Location: {event.location}</p>}
                  </div>
                  <div className="mt-3 inline-flex items-center px-3 py-1 border border-white rounded-full text-xs text-white uppercase tracking-wide">
                    {event.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <LinkButton
            href="/calendar"
            size="lg"
            shape="pill"
          >
            View Full Calendar
          </LinkButton>
        </div>
      </div>
    </section>
  );
};

export default CurrentMonthEvents;
