'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarMonth,
  School,
  Celebration,
  Assignment,
  BeachAccess,
  Download,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';

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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <School sx={{ color: '#2563eb', fontSize: 20 }} />;
      case 'holiday':
        return <BeachAccess sx={{ color: '#f59e0b', fontSize: 20 }} />;
      case 'exam':
        return <Assignment sx={{ color: '#dc2626', fontSize: 20 }} />;
      case 'event':
        return <Celebration sx={{ color: '#10b981', fontSize: 20 }} />;
      default:
        return <CalendarMonth sx={{ color: '#6b7280', fontSize: 20 }} />;
    }
  };

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

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dpis-calendar.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          School Calendar Events
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {showDownload && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadCalendar}
            >
              Download
            </Button>
          )}
          {isAdmin && onAddEvent && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={onAddEvent}
            >
              Add Event
            </Button>
          )}
        </Box>
      </Box>

      {/* Events List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sortedEvents.map((event) => (
          <Card
            key={event.id}
            sx={{
              backgroundColor: getEventColor(event.type),
              borderLeft: `4px solid ${getEventBorderColor(event.type)}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              },
            }}
            onClick={() => handleEventClick(event)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ mt: 1 }}>
                  {getEventIcon(event.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    {event.time && (
                      <Typography variant="body2" color="text.secondary">
                        Time: {event.time}
                      </Typography>
                    )}
                    {event.location && (
                      <Typography variant="body2" color="text.secondary">
                        Location: {event.location}
                      </Typography>
                    )}
                    {event.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      size="small"
                      sx={{
                        backgroundColor: getEventBorderColor(event.type),
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>
                {isAdmin && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {onEditEvent && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {onDeleteEvent && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event.id);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsOpen} onClose={() => setEventDetailsOpen(false)} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getEventIcon(selectedEvent.type)}
                <Typography variant="h6">{selectedEvent.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
                {selectedEvent.time && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Time</Typography>
                    <Typography variant="body1">{selectedEvent.time}</Typography>
                  </Box>
                )}
                {selectedEvent.location && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Location</Typography>
                    <Typography variant="body1">{selectedEvent.location}</Typography>
                  </Box>
                )}
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                    <Typography variant="body1">{selectedEvent.description}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Event Type</Typography>
                  <Chip
                    label={selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: getEventBorderColor(selectedEvent.type),
                      color: 'white',
                    }}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SchoolCalendar;
