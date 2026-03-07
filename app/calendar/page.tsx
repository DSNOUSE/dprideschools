'use client';

import React, { useState } from 'react';
import Container from '@/components/Container';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'special_event' | 'holiday' | 'sports' | 'arts' | 'parent_meeting';
  description?: string;
  time?: string;
  location?: string;
}

interface Term {
  name: string;
  startDate: string;
  endDate: string;
  halfTerm?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 26)); // February 2026
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Sample events for Q1 2026 based on the provided calendar
  const events: CalendarEvent[] = [
    // January 2026
    {
      id: 'jan6',
      title: 'Resumption Academic',
      date: '2026-01-06',
      type: 'academic',
      description: 'Students resume for Q1 2026'
    },
    {
      id: 'jan12',
      title: 'Academic Activities',
      date: '2026-01-12',
      type: 'academic'
    },
    {
      id: 'jan13',
      title: 'Academic Activities',
      date: '2026-01-13',
      type: 'academic'
    },
    {
      id: 'jan17',
      title: 'Year 9 Extra Lessons - Maths/NVE',
      date: '2026-01-17',
      type: 'academic',
      description: 'Extra lessons for Year 9 students'
    },
    {
      id: 'jan19',
      title: 'Academic Activities',
      date: '2026-01-19',
      type: 'academic'
    },
    {
      id: 'jan20',
      title: 'Academic Activities',
      date: '2026-01-20',
      type: 'academic'
    },
    {
      id: 'jan24',
      title: 'Year 9 Extra Lessons - CCA/Business Studies',
      date: '2026-01-24',
      type: 'academic'
    },
    {
      id: 'jan26',
      title: 'Academic Activities',
      date: '2026-01-26',
      type: 'academic'
    },
    {
      id: 'jan27',
      title: 'Academic Activities',
      date: '2026-01-27',
      type: 'academic'
    },
    {
      id: 'jan29',
      title: 'Academic Activities',
      date: '2026-01-29',
      type: 'academic'
    },
    {
      id: 'jan30',
      title: 'Academic Activities',
      date: '2026-01-30',
      type: 'academic'
    },
    {
      id: 'jan31',
      title: 'Year 9 Extra Lessons - BST/Maths',
      date: '2026-01-31',
      type: 'academic'
    },
    // February 2026
    {
      id: 'feb2',
      title: 'Academic Activities',
      date: '2026-02-02',
      type: 'academic'
    },
    {
      id: 'feb3',
      title: 'Academic Activities',
      date: '2026-02-03',
      type: 'academic'
    },
    {
      id: 'feb4',
      title: 'Academic Activities',
      date: '2026-02-04',
      type: 'academic'
    },
    {
      id: 'feb5',
      title: '1st CA Begins',
      date: '2026-02-05',
      type: 'academic',
      description: 'First Continuous Assessment begins'
    },
    {
      id: 'feb6',
      title: '1st CA Continues',
      date: '2026-02-06',
      type: 'academic'
    },
    {
      id: 'feb7',
      title: 'End of 1st CA',
      date: '2026-02-07',
      type: 'academic',
      description: 'First Continuous Assessment ends'
    },
    {
      id: 'feb9',
      title: 'Academic Activities',
      date: '2026-02-09',
      type: 'academic'
    },
    {
      id: 'feb10',
      title: 'Academic Activities',
      date: '2026-02-10',
      type: 'academic'
    },
    {
      id: 'feb11',
      title: 'Academic Activities',
      date: '2026-02-11',
      type: 'academic'
    },
    {
      id: 'feb12',
      title: 'OPEN DAY MID TERM',
      date: '2026-02-12',
      type: 'special_event',
      description: 'Mid-term open day for parents'
    },
    {
      id: 'feb13',
      title: 'MID TERM',
      date: '2026-02-13',
      type: 'holiday',
      description: 'Mid-term break begins'
    },
    {
      id: 'feb14',
      title: 'MID TERM',
      date: '2026-02-14',
      type: 'holiday'
    },
    {
      id: 'feb16',
      title: 'Academic Activities',
      date: '2026-02-16',
      type: 'academic'
    },
    {
      id: 'feb17',
      title: 'Academic Activities',
      date: '2026-02-17',
      type: 'academic'
    },
    {
      id: 'feb18',
      title: 'Academic Activities',
      date: '2026-02-18',
      type: 'academic'
    },
    {
      id: 'feb19',
      title: 'Academic Activities',
      date: '2026-02-19',
      type: 'academic'
    },
    {
      id: 'feb20',
      title: 'Academic Activities',
      date: '2026-02-20',
      type: 'academic'
    },
    {
      id: 'feb21',
      title: 'Academic Activities',
      date: '2026-02-21',
      type: 'academic'
    },
    {
      id: 'feb23',
      title: 'Academic Activities',
      date: '2026-02-23',
      type: 'academic'
    },
    {
      id: 'feb24',
      title: 'Academic Activities',
      date: '2026-02-24',
      type: 'academic'
    },
    {
      id: 'feb25',
      title: 'Academic Activities',
      date: '2026-02-25',
      type: 'academic'
    },
    {
      id: 'feb26',
      title: 'Academic Activities',
      date: '2026-02-26',
      type: 'academic'
    },
    {
      id: 'feb27',
      title: 'Academic Activities',
      date: '2026-02-27',
      type: 'academic'
    },
    {
      id: 'feb28',
      title: 'CULTURAL DAY',
      date: '2026-02-28',
      type: 'arts',
      description: 'Annual cultural day celebration'
    },
    // March 2026
    {
      id: 'mar2',
      title: 'Academic Activities',
      date: '2026-03-02',
      type: 'academic'
    },
    {
      id: 'mar3',
      title: 'Academic Activities',
      date: '2026-03-03',
      type: 'academic'
    },
    {
      id: 'mar4',
      title: '2nd CA Begins',
      date: '2026-03-04',
      type: 'academic',
      description: 'Second Continuous Assessment begins'
    },
    {
      id: 'mar5',
      title: '2nd CA Continues',
      date: '2026-03-05',
      type: 'academic'
    },
    {
      id: 'mar6',
      title: '2nd CA Ends',
      date: '2026-03-06',
      type: 'academic',
      description: 'Second Continuous Assessment ends'
    },
    {
      id: 'mar7',
      title: 'Year 9 2nd BECE MOCK',
      date: '2026-03-07',
      type: 'academic',
      description: 'BECE Mock examination for Year 9'
    },
    {
      id: 'mar8',
      title: 'Year 9 Extra Lessons - History/Maths',
      date: '2026-03-08',
      type: 'academic'
    },
    {
      id: 'mar9',
      title: 'Academic Activities',
      date: '2026-03-09',
      type: 'academic'
    },
    {
      id: 'mar10',
      title: 'Academic Activities',
      date: '2026-03-10',
      type: 'academic'
    },
    {
      id: 'mar11',
      title: 'Academic Activities',
      date: '2026-03-11',
      type: 'academic'
    },
    {
      id: 'mar12',
      title: 'Academic Activities',
      date: '2026-03-12',
      type: 'academic'
    },
    {
      id: 'mar13',
      title: 'Academic Activities',
      date: '2026-03-13',
      type: 'academic'
    },
    {
      id: 'mar14',
      title: 'Year 9 Extra Lessons - Basic Tech',
      date: '2026-03-14',
      type: 'academic'
    },
    {
      id: 'mar15',
      title: 'Academic Activities',
      date: '2026-03-15',
      type: 'academic'
    },
    {
      id: 'mar16',
      title: 'PUBLIC HOLIDAY - EID',
      date: '2026-03-16',
      type: 'holiday',
      description: 'Eid holiday celebration'
    },
    {
      id: 'mar17',
      title: 'PUBLIC HOLIDAY - EID',
      date: '2026-03-17',
      type: 'holiday'
    },
    {
      id: 'mar18',
      title: 'Academic Activities',
      date: '2026-03-18',
      type: 'academic'
    },
    {
      id: 'mar19',
      title: 'Academic Activities',
      date: '2026-03-19',
      type: 'academic'
    },
    {
      id: 'mar20',
      title: 'Academic Activities',
      date: '2026-03-20',
      type: 'academic'
    },
    {
      id: 'mar21',
      title: 'Year 9 Extra Lessons - History/Maths',
      date: '2026-03-21',
      type: 'academic'
    },
    {
      id: 'mar22',
      title: 'Academic Activities',
      date: '2026-03-22',
      type: 'academic'
    },
    {
      id: 'mar23',
      title: 'REVISION',
      date: '2026-03-23',
      type: 'academic',
      description: 'Revision period begins'
    },
    {
      id: 'mar24',
      title: 'REVISION',
      date: '2026-03-24',
      type: 'academic'
    },
    {
      id: 'mar25',
      title: 'REVISION',
      date: '2026-03-25',
      type: 'academic'
    },
    {
      id: 'mar26',
      title: 'REVISION',
      date: '2026-03-26',
      type: 'academic'
    },
    {
      id: 'mar27',
      title: 'REVISION',
      date: '2026-03-27',
      type: 'academic'
    },
    {
      id: 'mar28',
      title: 'EXAMS BEGIN',
      date: '2026-03-28',
      type: 'academic',
      description: 'Final examinations begin'
    },
    {
      id: 'mar29',
      title: 'EXAMS',
      date: '2026-03-29',
      type: 'academic'
    }
  ];

  const terms: Term[] = [
    {
      name: 'Q1 2026',
      startDate: 'January 6, 2026',
      endDate: 'March 29, 2026',
      halfTerm: 'February 13-14, 2026'
    }
  ];

  const eventTypes = [
    { id: 'all', label: 'All Events', color: 'bg-gray-500' },
    { id: 'academic', label: 'Academic', color: 'bg-blue-500' },
    { id: 'special_event', label: 'Special Event', color: 'bg-red-500' },
    { id: 'holiday', label: 'Holiday', color: 'bg-green-500' },
    { id: 'arts', label: 'Arts', color: 'bg-pink-500' }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-500';
      case 'special_event': return 'bg-red-500';
      case 'holiday': return 'bg-green-500';
      case 'sports': return 'bg-orange-500';
      case 'arts': return 'bg-pink-500';
      case 'parent_meeting': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDay = (day: number, month: number) => {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `2026-${monthStr}-${dayStr}`;
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 1, 26)); // Today is Feb 26, 2026
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen">
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-600 text-white text-xl">
                📅
              </div>
              <h1 className="text-3xl font-bold text-gray-900">School Calendar</h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Term Overviews */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {terms.map((term, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">{term.name}</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>{term.startDate} - {term.endDate}</p>
                  {term.halfTerm && (
                    <p>Half-term: {term.halfTerm}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Event Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFilter(type.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedFilter === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">◀</span>
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">▶</span>
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayEvents = day ? getEventsForDay(day, currentDate.getMonth() + 1) : [];
                    const isToday = day === 26 && currentDate.getMonth() === 1 && currentDate.getFullYear() === 2026;
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] border border-gray-200 rounded-lg p-2 ${
                          day ? 'hover:bg-gray-50' : ''
                        } ${
                          isToday ? 'ring-2 ring-green-500 border-green-500' : ''
                        }`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded ${getEventColor(event.type)} text-white truncate`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} Events
              </h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Types Legend */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-700">Academic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-700">Sports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-sm text-gray-700">Arts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-700">Parent Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-700">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-700">Special Event</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CalendarPage;
