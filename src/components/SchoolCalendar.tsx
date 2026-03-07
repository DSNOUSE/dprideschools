'use client';

import React, { useState } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'holiday' | 'event' | 'exam' | 'meeting';
  description?: string;
  time?: string;
  location?: string;
}

interface SchoolCalendarProps {
  events: CalendarEvent[];
  isAdmin?: boolean;
  onAddEvent?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  showDownload?: boolean;
}

const SchoolCalendar: React.FC<SchoolCalendarProps> = ({
  events,
  isAdmin = false,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  showDownload = false,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

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
        return '#2563eb';
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

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const downloadCalendar = () => {
    const calendarData = events.map(event => ({
      title: event.title,
      date: event.date,
      type: event.type,
      time: event.time,
      location: event.location,
      description: event.description,
    }));

    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'dpis-calendar.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-slate-900">School Calendar Events</h2>
        <div className="flex gap-2">
          {showDownload && (
            <button
              onClick={downloadCalendar}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white hover:bg-slate-50"
            >
              Download
            </button>
          )}
          {isAdmin && onAddEvent && (
            <button
              onClick={onAddEvent}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-xl p-4 cursor-pointer transition-all"
            style={{
              backgroundColor: getEventColor(event.type),
              borderLeft: `4px solid ${getEventBorderColor(event.type)}`,
            }}
            onClick={() => handleEventClick(event)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-slate-700">
                {event.type === 'academic'
                  ? '📘'
                  : event.type === 'holiday'
                  ? '🌴'
                  : event.type === 'exam'
                  ? '📝'
                  : '📅'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{event.title}</h3>
                <div className="flex flex-col gap-0.5 text-sm text-slate-700">
                  <span className="font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {event.time && <span>Time: {event.time}</span>}
                  {event.location && <span>Location: {event.location}</span>}
                  {event.description && <span className="mt-1">{event.description}</span>}
                </div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wide"
                  style={{ backgroundColor: getEventBorderColor(event.type) }}
                >
                  {event.type}
                </div>
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1">
                  {onEditEvent && (
                    <button
                      className="px-2 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteEvent && (
                    <button
                      className="px-2 py-1 text-xs rounded border border-red-300 text-red-700 bg-white hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event.id);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Dialog */}
      {eventDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setEventDetailsOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
                <p>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {selectedEvent.time && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Time</p>
                  <p>{selectedEvent.time}</p>
                </div>
              )}
              {selectedEvent.location && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Event Type</p>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wide"
                  style={{ backgroundColor: getEventBorderColor(selectedEvent.type) }}
                >
                  {selectedEvent.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolCalendar;
