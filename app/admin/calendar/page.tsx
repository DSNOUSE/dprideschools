'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth,
  Add,
  Edit,
  Delete,
  Event,
  School,
  Celebration,
  Assignment,
  BeachAccess,
} from '@mui/icons-material';

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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <School sx={{ color: '#2563eb' }} />;
      case 'holiday':
        return <BeachAccess sx={{ color: '#f59e0b' }} />;
      case 'exam':
        return <Assignment sx={{ color: '#dc2626' }} />;
      case 'event':
        return <Celebration sx={{ color: '#10b981' }} />;
      default:
        return <Event sx={{ color: '#6b7280' }} />;
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

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          School Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
        >
          Add Event
        </Button>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Q1 2025 Calendar Events
            </Typography>
            {sortedEvents.map((event) => (
              <Card key={event.id} sx={{ mb: 2, backgroundColor: getEventColor(event.type) }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {getEventIcon(event.type)}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(event)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEvent(event.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </div>

        <div className="md:col-span-1">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Event Types
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School sx={{ color: '#2563eb' }} />
                <Typography>Academic Events</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BeachAccess sx={{ color: '#f59e0b' }} />
                <Typography>Holidays</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment sx={{ color: '#dc2626' }} />
                <Typography>Examinations</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Celebration sx={{ color: '#10b981' }} />
                <Typography>Events & Activities</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2">
                Total Events: {events.length}
              </Typography>
              <Typography variant="body2">
                Academic Days: {events.filter(e => e.type === 'academic').length}
              </Typography>
              <Typography variant="body2">
                Holidays: {events.filter(e => e.type === 'holiday').length}
              </Typography>
              <Typography variant="body2">
                Examinations: {events.filter(e => e.type === 'exam').length}
              </Typography>
              <Typography variant="body2">
                Events: {events.filter(e => e.type === 'event').length}
              </Typography>
            </Box>
          </Paper>
        </div>
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })
                }
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="holiday">Holiday</MenuItem>
                <MenuItem value="exam">Examination</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Time"
              fullWidth
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="e.g., 9:00 AM"
            />
            <TextField
              label="Location"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveEvent} variant="contained" color="primary">
            {editingEvent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
