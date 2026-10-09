'use client';

import React, { useState } from 'react';
import Container from '@/components/Container';
import { CalendarMonth } from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'special_event' | 'holiday' | 'sports' | 'arts' | 'parent_meeting' | 'exam';
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 15)); // October 2026
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Events for Q1 2026/2027 (September - December 2026)
  const events: CalendarEvent[] = [
    // September 2026
    {
      id: 'sep7',
      title: 'RESUMPTION',
      date: '2026-09-07',
      type: 'academic',
      description: 'Students resume for Q1 2026/2027'
    },
    {
      id: 'sep8',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-08',
      type: 'academic'
    },
    {
      id: 'sep9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-09',
      type: 'academic'
    },
    {
      id: 'sep10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-10',
      type: 'academic'
    },
    {
      id: 'sep11',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-11',
      type: 'academic'
    },
    {
      id: 'sep14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-14',
      type: 'academic'
    },
    {
      id: 'sep15',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-15',
      type: 'academic'
    },
    {
      id: 'sep16',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-16',
      type: 'academic'
    },
    {
      id: 'sep17',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-17',
      type: 'academic'
    },
    {
      id: 'sep18',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-18',
      type: 'academic'
    },
    {
      id: 'sep21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-21',
      type: 'academic'
    },
    {
      id: 'sep22',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-22',
      type: 'academic'
    },
    {
      id: 'sep23',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-23',
      type: 'academic'
    },
    {
      id: 'sep24',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-24',
      type: 'academic'
    },
    {
      id: 'sep25',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-25',
      type: 'academic'
    },
    {
      id: 'sep26',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-26',
      type: 'academic'
    },
    {
      id: 'sep28',
      title: 'FIRST CA',
      date: '2026-09-28',
      type: 'academic',
      description: 'First Continuous Assessment'
    },
    {
      id: 'sep29',
      title: 'FIRST CA',
      date: '2026-09-29',
      type: 'academic'
    },
    {
      id: 'sep30',
      title: 'FIRST CA',
      date: '2026-09-30',
      type: 'academic'
    },
    // October 2026
    {
      id: 'oct1',
      title: 'INDEPENDENCE DAY',
      date: '2026-10-01',
      type: 'holiday',
      description: 'Nigeria Independence Day'
    },
    {
      id: 'oct2',
      title: 'FIRST CA',
      date: '2026-10-02',
      type: 'academic'
    },
    {
      id: 'oct5',
      title: "TEACHER'S DAY",
      date: '2026-10-05',
      type: 'special_event',
      description: "Teacher's Day celebration"
    },
    {
      id: 'oct6',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-06',
      type: 'academic'
    },
    {
      id: 'oct7',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-07',
      type: 'academic'
    },
    {
      id: 'oct8',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-08',
      type: 'academic'
    },
    {
      id: 'oct9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-09',
      type: 'academic'
    },
    {
      id: 'oct10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-10',
      type: 'academic'
    },
    {
      id: 'oct12',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-12',
      type: 'academic'
    },
    {
      id: 'oct13',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-13',
      type: 'academic'
    },
    {
      id: 'oct14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-14',
      type: 'academic'
    },
    {
      id: 'oct14-open',
      title: 'OPEN DAY',
      date: '2026-10-14',
      type: 'special_event',
      description: 'Open day for parents'
    },
    {
      id: 'oct15',
      title: 'MID TERM BREAK',
      date: '2026-10-15',
      type: 'holiday',
      description: 'Mid-term break begins'
    },
    {
      id: 'oct16',
      title: 'MID TERM BREAK',
      date: '2026-10-16',
      type: 'holiday'
    },
    {
      id: 'oct19',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-19',
      type: 'academic'
    },
    {
      id: 'oct20',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-20',
      type: 'academic'
    },
    {
      id: 'oct21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-21',
      type: 'academic'
    },
    {
      id: 'oct22',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-22',
      type: 'academic'
    },
    {
      id: 'oct23',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-23',
      type: 'academic'
    },
    {
      id: 'oct24',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-24',
      type: 'academic'
    },
    {
      id: 'oct25',
      title: 'INTERHOUSE SPORTS DAY',
      date: '2026-10-25',
      type: 'sports',
      description: 'Annual inter-house sports competition'
    },
    {
      id: 'oct26',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-26',
      type: 'academic'
    },
    {
      id: 'oct27',
      title: 'SECOND CA',
      date: '2026-10-27',
      type: 'academic',
      description: 'Second Continuous Assessment'
    },
    {
      id: 'oct28',
      title: 'SECOND CA',
      date: '2026-10-28',
      type: 'academic'
    },
    {
      id: 'oct29',
      title: 'SECOND CA',
      date: '2026-10-29',
      type: 'academic'
    },
    {
      id: 'oct30',
      title: 'SECOND CA',
      date: '2026-10-30',
      type: 'academic'
    },
    {
      id: 'oct31',
      title: 'SECOND CA',
      date: '2026-10-31',
      type: 'academic'
    },
    // November 2026
    {
      id: 'nov2',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-02',
      type: 'academic'
    },
    {
      id: 'nov3',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-03',
      type: 'academic'
    },
    {
      id: 'nov4',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-04',
      type: 'academic'
    },
    {
      id: 'nov5',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-05',
      type: 'academic'
    },
    {
      id: 'nov6',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-06',
      type: 'academic'
    },
    {
      id: 'nov7',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-07',
      type: 'academic'
    },
    {
      id: 'nov9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-09',
      type: 'academic'
    },
    {
      id: 'nov10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-10',
      type: 'academic'
    },
    {
      id: 'nov11',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-11',
      type: 'academic'
    },
    {
      id: 'nov12',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-12',
      type: 'academic'
    },
    {
      id: 'nov13',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-13',
      type: 'academic'
    },
    {
      id: 'nov14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-14',
      type: 'academic'
    },
    {
      id: 'nov16',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-16',
      type: 'academic'
    },
    {
      id: 'nov17',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-17',
      type: 'academic'
    },
    {
      id: 'nov18',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-18',
      type: 'academic'
    },
    {
      id: 'nov19',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-19',
      type: 'academic'
    },
    {
      id: 'nov20',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-20',
      type: 'academic'
    },
    {
      id: 'nov21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-21',
      type: 'academic'
    },
    {
      id: 'nov23',
      title: 'REVISION',
      date: '2026-11-23',
      type: 'academic',
      description: 'Revision period begins'
    },
    {
      id: 'nov24',
      title: 'REVISION',
      date: '2026-11-24',
      type: 'academic'
    },
    {
      id: 'nov25',
      title: 'REVISION',
      date: '2026-11-25',
      type: 'academic'
    },
    {
      id: 'nov26',
      title: 'REVISION',
      date: '2026-11-26',
      type: 'academic'
    },
    {
      id: 'nov27',
      title: 'REVISION',
      date: '2026-11-27',
      type: 'academic'
    },
    {
      id: 'nov28',
      title: 'REVISION',
      date: '2026-11-28',
      type: 'academic'
    },
    {
      id: 'nov30',
      title: 'EXAM BEGINS',
      date: '2026-11-30',
      type: 'exam',
      description: 'Final examinations begin'
    },
    // December 2026
    {
      id: 'dec1',
      title: 'EXAM CONT.',
      date: '2026-12-01',
      type: 'exam'
    },
    {
      id: 'dec2',
      title: 'EXAM CONT.',
      date: '2026-12-02',
      type: 'exam'
    },
    {
      id: 'dec3',
      title: 'EXAM CONT.',
      date: '2026-12-03',
      type: 'exam'
    },
    {
      id: 'dec4',
      title: 'EXAM CONT.',
      date: '2026-12-04',
      type: 'exam'
    },
    {
      id: 'dec5',
      title: 'EXAM ENDS',
      date: '2026-12-05',
      type: 'exam',
      description: 'Final examinations end'
    },
    {
      id: 'dec7',
      title: 'MARKING',
      date: '2026-12-07',
      type: 'academic',
      description: 'Marking of examination papers'
    },
    {
      id: 'dec8',
      title: 'MARKING',
      date: '2026-12-08',
      type: 'academic'
    },
    {
      id: 'dec9',
      title: 'MARKING',
      date: '2026-12-09',
      type: 'academic'
    },
    {
      id: 'dec10',
      title: 'MARKING',
      date: '2026-12-10',
      type: 'academic'
    },
    {
      id: 'dec11',
      title: 'MARKING',
      date: '2026-12-11',
      type: 'academic'
    },
    {
      id: 'dec12',
      title: 'MARKING',
      date: '2026-12-12',
      type: 'academic'
    },
    {
      id: 'dec14',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-14',
      type: 'holiday',
      description: 'Christmas holiday begins'
    },
    {
      id: 'dec15',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-15',
      type: 'holiday'
    },
    {
      id: 'dec16',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-16',
      type: 'holiday'
    },
    {
      id: 'dec17',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-17',
      type: 'holiday'
    },
    {
      id: 'dec18',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-18',
      type: 'holiday'
    },
    {
      id: 'dec19',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-19',
      type: 'holiday'
    },
    {
      id: 'dec20',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-20',
      type: 'holiday'
    },
    {
      id: 'dec21',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-21',
      type: 'holiday'
    },
    {
      id: 'dec22',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-22',
      type: 'holiday'
    },
    {
      id: 'dec23',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-23',
      type: 'holiday'
    },
    {
      id: 'dec24',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-24',
      type: 'holiday'
    },
    {
      id: 'dec25',
      title: 'CHRISTMAS DAY',
      date: '2026-12-25',
      type: 'holiday',
      description: 'Christmas Day celebration'
    },
    {
      id: 'dec26',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-26',
      type: 'holiday'
    },
    {
      id: 'dec27',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-27',
      type: 'holiday'
    },
    {
      id: 'dec28',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-28',
      type: 'holiday'
    },
    {
      id: 'dec29',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-29',
      type: 'holiday'
    },
    {
      id: 'dec30',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-30',
      type: 'holiday'
    },
    {
      id: 'dec31',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-31',
      type: 'holiday'
    }
  ];

  const terms: Term[] = [
    {
      name: 'Q1 2026/2027',
      startDate: 'September 7, 2026',
      endDate: 'December 5, 2026',
      halfTerm: 'October 15-16, 2026'
    }
  ];

  const eventTypes = [
    { id: 'all', label: 'All Events', color: 'bg-gray-500' },
    { id: 'academic', label: 'Academic', color: 'bg-blue-500' },
    { id: 'special_event', label: 'Special Event', color: 'bg-red-500' },
    { id: 'holiday', label: 'Holiday', color: 'bg-green-500' },
    { id: 'sports', label: 'Sports', color: 'bg-orange-500' },
    { id: 'exam', label: 'Exam', color: 'bg-purple-500' }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-500';
      case 'special_event': return 'bg-red-500';
      case 'holiday': return 'bg-green-500';
      case 'sports': return 'bg-orange-500';
      case 'exam': return 'bg-purple-500';
      case 'arts': return 'bg-pink-500';
      case 'parent_meeting': return 'bg-yellow-500';
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
    setCurrentDate(new Date(2026, 9, 15)); // Navigate to October 15, 2026
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
                <CalendarMonth sx={{ fontSize: 20, color: '#fff' }} />
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
                    const isToday = day === 15 && currentDate.getMonth() === 9 && currentDate.getFullYear() === 2026;
                    
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
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-700">Exam</span>
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
