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
    {
      id: '1',
      title: 'First Day of Term - Q1 2025',
      date: '2025-01-06',
      type: 'academic',
      description: 'Students resume for the first term of 2025',
      time: '8:00 AM',
      location: 'School Premises',
    },
    {
      id: '2',
      title: 'New Students Orientation',
      date: '2025-01-08',
      type: 'event',
      description: 'Orientation program for new students and parents',
      time: '10:00 AM',
      location: 'School Hall',
    },
    {
      id: '3',
      title: 'First Assessment Test',
      date: '2025-01-20',
      type: 'exam',
      description: 'First continuous assessment test for all classes',
      time: '9:00 AM',
      location: 'Various Classrooms',
    },
    {
      id: '4',
      title: 'Inter-House Sports Competition',
      date: '2025-01-25',
      type: 'event',
      description: 'Annual inter-house sports competition',
      time: '9:00 AM',
      location: 'School Sports Field',
    },
    {
      id: '5',
      title: 'Mid-Term Break',
      date: '2025-02-10',
      type: 'holiday',
      description: 'Mid-term break for students',
      time: 'All Day',
      location: 'Home',
    },
    {
      id: '6',
      title: 'Mid-Term Break Ends',
      date: '2025-02-14',
      type: 'academic',
      description: 'Students resume from mid-term break',
      time: '8:00 AM',
      location: 'School Premises',
    },
    {
      id: '7',
      title: 'Second Assessment Test',
      date: '2025-02-24',
      type: 'exam',
      description: 'Second continuous assessment test',
      time: '9:00 AM',
      location: 'Various Classrooms',
    },
    {
      id: '8',
      title: 'Career Day',
      date: '2025-03-07',
      type: 'event',
      description: 'Career guidance and counseling day',
      time: '10:00 AM',
      location: 'School Hall',
    },
    {
      id: '9',
      title: 'End of Term Examinations',
      date: '2025-03-17',
      type: 'exam',
      description: 'Final examinations for Q1 2025',
      time: '9:00 AM',
      location: 'Examination Halls',
    },
    {
      id: '10',
      title: 'Last Day of Term - Q1 2025',
      date: '2025-03-28',
      type: 'academic',
      description: 'Final day of first term 2025',
      time: '12:00 PM',
      location: 'School Premises',
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
          <h2 className="text-lg font-semibold text-slate-900">Q1 2025 Calendar Events</h2>
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
