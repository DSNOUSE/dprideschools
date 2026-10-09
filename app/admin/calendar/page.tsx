'use client';

import React, { useState } from 'react';
import { MenuBook, BeachAccess, EditNote, CalendarMonth, Celebration } from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'holiday' | 'event' | 'exam' | 'meeting';
  description?: string;
  time?: string;
  location?: string;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    // September 2026
    {
      id: 'sep7',
      title: 'RESUMPTION - Q1 2026/2027',
      date: '2026-09-07',
      type: 'academic',
      description: 'Students resume for Q1 2026/2027',
      time: '8:00 AM',
      location: 'School Premises',
    },
    {
      id: 'sep8',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-08',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-09',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-10',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep11',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-11',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-14',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep15',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-15',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep16',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-16',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep17',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-17',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep18',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-18',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-21',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep22',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-22',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep23',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-23',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep24',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-24',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep25',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-25',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep26',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-09-26',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'sep28',
      title: 'FIRST CA',
      date: '2026-09-28',
      type: 'exam',
      description: 'First Continuous Assessment',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'sep29',
      title: 'FIRST CA',
      date: '2026-09-29',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'sep30',
      title: 'FIRST CA',
      date: '2026-09-30',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    // October 2026
    {
      id: 'oct1',
      title: 'INDEPENDENCE DAY',
      date: '2026-10-01',
      type: 'holiday',
      description: 'Nigeria Independence Day',
      time: 'All Day',
      location: 'National Holiday',
    },
    {
      id: 'oct2',
      title: 'FIRST CA',
      date: '2026-10-02',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'oct5',
      title: "TEACHER'S DAY",
      date: '2026-10-05',
      type: 'event',
      description: "Teacher's Day celebration",
      time: '10:00 AM',
      location: 'School Hall',
    },
    {
      id: 'oct6',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-06',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct7',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-07',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct8',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-08',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-09',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-10',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct12',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-12',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct13',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-13',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-14',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct14-open',
      title: 'OPEN DAY',
      date: '2026-10-14',
      type: 'event',
      description: 'Open day for parents',
      time: '10:00 AM',
      location: 'School Premises',
    },
    {
      id: 'oct15',
      title: 'MID TERM BREAK',
      date: '2026-10-15',
      type: 'holiday',
      description: 'Mid-term break begins',
      time: 'All Day',
      location: 'Home',
    },
    {
      id: 'oct16',
      title: 'MID TERM BREAK',
      date: '2026-10-16',
      type: 'holiday',
      time: 'All Day',
      location: 'Home',
    },
    {
      id: 'oct19',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-19',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct20',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-20',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-21',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct22',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-22',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct23',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-23',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct24',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-24',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct25',
      title: 'INTERHOUSE SPORTS DAY',
      date: '2026-10-25',
      type: 'event',
      description: 'Annual inter-house sports competition',
      time: '9:00 AM',
      location: 'School Sports Field',
    },
    {
      id: 'oct26',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-10-26',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'oct27',
      title: 'SECOND CA',
      date: '2026-10-27',
      type: 'exam',
      description: 'Second Continuous Assessment',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'oct28',
      title: 'SECOND CA',
      date: '2026-10-28',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'oct29',
      title: 'SECOND CA',
      date: '2026-10-29',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'oct30',
      title: 'SECOND CA',
      date: '2026-10-30',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'oct31',
      title: 'SECOND CA',
      date: '2026-10-31',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    // November 2026
    {
      id: 'nov2',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-02',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov3',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-03',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov4',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-04',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov5',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-05',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov6',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-06',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov7',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-07',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov9',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-09',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov10',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-10',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov11',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-11',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov12',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-12',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov13',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-13',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov14',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-14',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov16',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-16',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov17',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-17',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov18',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-18',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov19',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-19',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov20',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-20',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov21',
      title: 'ACADEMIC ACTIVITIES',
      date: '2026-11-21',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov23',
      title: 'REVISION',
      date: '2026-11-23',
      type: 'academic',
      description: 'Revision period begins',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov24',
      title: 'REVISION',
      date: '2026-11-24',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov25',
      title: 'REVISION',
      date: '2026-11-25',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov26',
      title: 'REVISION',
      date: '2026-11-26',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov27',
      title: 'REVISION',
      date: '2026-11-27',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov28',
      title: 'REVISION',
      date: '2026-11-28',
      type: 'academic',
      time: '8:00 AM',
      location: 'Classrooms',
    },
    {
      id: 'nov30',
      title: 'EXAM BEGINS',
      date: '2026-11-30',
      type: 'exam',
      description: 'Final examinations begin',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    // December 2026
    {
      id: 'dec1',
      title: 'EXAM CONT.',
      date: '2026-12-01',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'dec2',
      title: 'EXAM CONT.',
      date: '2026-12-02',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'dec3',
      title: 'EXAM CONT.',
      date: '2026-12-03',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'dec4',
      title: 'EXAM CONT.',
      date: '2026-12-04',
      type: 'exam',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: 'dec5',
      title: 'EXAM ENDS',
      date: '2026-12-05',
      type: 'exam',
      description: 'Final examinations end',
      time: '12:00 PM',
      location: 'Examination Halls',
    },
    {
      id: 'dec7',
      title: 'MARKING',
      date: '2026-12-07',
      type: 'academic',
      description: 'Marking of examination papers',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec8',
      title: 'MARKING',
      date: '2026-12-08',
      type: 'academic',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec9',
      title: 'MARKING',
      date: '2026-12-09',
      type: 'academic',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec10',
      title: 'MARKING',
      date: '2026-12-10',
      type: 'academic',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec11',
      title: 'MARKING',
      date: '2026-12-11',
      type: 'academic',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec12',
      title: 'MARKING',
      date: '2026-12-12',
      type: 'academic',
      time: '9:00 AM',
      location: 'Staff Room',
    },
    {
      id: 'dec14',
      title: 'CHRISTMAS BREAK',
      date: '2026-12-14',
      type: 'holiday',
      description: 'Christmas holiday begins',
      time: 'All Day',
      location: 'Home',
    },
    {
      id: 'dec25',
      title: 'CHRISTMAS DAY',
      date: '2026-12-25',
      type: 'holiday',
      description: 'Christmas Day celebration',
      time: 'All Day',
      location: 'Home',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    date: '',
    type: 'event',
    description: '',
    time: '',
    location: '',
  });

  const getEventColor = (type: string) => {
    switch (type) {
      case 'academic':
        return '#e0f2fe';
      case 'holiday':
        return '#fef3c7';
      case 'exam':
        return '#fee2e2';
      case 'event':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  };

  const getEventBorderColor = (type: string) => {
    switch (type) {
      case 'academic':
        return '#0284c7';
      case 'holiday':
        return '#f59e0b';
      case 'exam':
        return '#dc2626';
      case 'event':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: '',
        type: 'event',
        description: '',
        time: '',
        location: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: editingEvent.id } as CalendarEvent : e));
    } else {
      const newEvent: CalendarEvent = {
        ...formData,
        id: Date.now().toString(),
      } as CalendarEvent;
      setEvents([...events, newEvent]);
    }
    handleCloseDialog();
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">School Calendar</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Events list */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Q1 2026/2027 Calendar Events</h2>
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl p-4 bg-white shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
              style={{
                backgroundColor: getEventColor(event.type),
              }}
              onClick={() => handleOpenDialog(event)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-lg">
                  {event.type === 'academic' ? (
                    <MenuBook sx={{ fontSize: 18, color: '#0f172a' }} />
                  ) : event.type === 'holiday' ? (
                    <BeachAccess sx={{ fontSize: 18, color: '#0f172a' }} />
                  ) : event.type === 'exam' ? (
                    <EditNote sx={{ fontSize: 18, color: '#0f172a' }} />
                  ) : (
                    <CalendarMonth sx={{ fontSize: 18, color: '#0f172a' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-700">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wide"
                      style={{ backgroundColor: getEventBorderColor(event.type) }}
                    >
                      {event.type}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-800">
                    {event.time && <p>Time: {event.time}</p>}
                    {event.location && <p>Location: {event.location}</p>}
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/70 text-slate-800">
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Event Types</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <MenuBook sx={{ fontSize: 18, color: '#0f172a' }} />
                <span>Academic Events</span>
              </li>
              <li className="flex items-center gap-2">
                <BeachAccess sx={{ fontSize: 18, color: '#0f172a' }} />
                <span>Holidays</span>
              </li>
              <li className="flex items-center gap-2">
                <EditNote sx={{ fontSize: 18, color: '#0f172a' }} />
                <span>Examinations</span>
              </li>
              <li className="flex items-center gap-2">
                <Celebration sx={{ fontSize: 18, color: '#0f172a' }} />
                <span>Events & Activities</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Quick Stats</h3>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between">
                <dt>Total Events</dt>
                <dd className="font-semibold">{events.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Academic Days</dt>
                <dd className="font-semibold">
                  {events.filter((e) => e.type === 'academic').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Holidays</dt>
                <dd className="font-semibold">
                  {events.filter((e) => e.type === 'holiday').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Examinations</dt>
                <dd className="font-semibold">
                  {events.filter((e) => e.type === 'exam').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Events</dt>
                <dd className="font-semibold">
                  {events.filter((e) => e.type === 'event').length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Add/Edit dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="academic">Academic</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Examination</option>
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 9:00 AM"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                {editingEvent ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
