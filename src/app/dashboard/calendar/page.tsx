'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Users,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
}

export default function CalendarPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/calendar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error('Failed to connect to Google Calendar');
      }
    } catch (error) {
      toast.error('Failed to connect to Google Calendar');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setIsConnected(false);
        setEvents([]);
        toast.success('Google Calendar disconnected');
      } else {
        toast.error('Failed to disconnect Google Calendar');
      }
    } catch (error) {
      toast.error('Failed to disconnect Google Calendar');
    }
  };

  const refreshEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        toast.success('Events refreshed');
      } else {
        toast.error('Failed to refresh events');
      }
    } catch (error) {
      toast.error('Failed to refresh events');
    }
  };

  const getEventsByDate = () => {
    const eventsByDate: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.start).toDateString();
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });

    return eventsByDate;
  };

  const isEventToday = (eventDate: string) => {
    const today = new Date().toDateString();
    const eventDay = new Date(eventDate).toDateString();
    return today === eventDay;
  };

  const isEventUpcoming = (eventDate: string) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime > now;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your calendar integration and view upcoming events.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isConnected && (
            <Button onClick={refreshEvents} variant="outline" className="flex items-center gap-2">
              {/* <Sync className="h-4 w-4" /> */}
              Refresh
            </Button>
          )}
          
          {isConnected ? (
            <Button 
              onClick={disconnectGoogleCalendar}
              variant="destructive" 
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button 
              onClick={connectGoogleCalendar}
              disabled={connecting}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="flex-1">
              <h3 className="font-semibold">
                Google Calendar {isConnected ? 'Connected' : 'Not Connected'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isConnected 
                  ? 'Your Google Calendar is successfully connected. Tasks with due dates can be synced to your calendar.'
                  : 'Connect your Google Calendar to sync tasks and view events.'
                }
              </p>
            </div>
            {isConnected ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Display */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.filter(event => isEventToday(event.start)).length === 0 ? (
                  <p className="text-gray-500 text-sm">No events today</p>
                ) : (
                  events
                    .filter(event => isEventToday(event.start))
                    .map(event => (
                      <div key={event.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-300">
                          <Clock className="h-3 w-3" />
                          {new Date(event.start).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-300">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(getEventsByDate())
                  .filter(([date]) => new Date(date) >= new Date())
                  .slice(0, 10)
                  .map(([date, dayEvents]) => (
                    <div key={date}>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {formatDate(date)}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {dayEvents.map(event => (
                          <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              isEventToday(event.start) ? 'bg-blue-500' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm truncate">{event.title}</h5>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-300">
                                <span>
                                  {new Date(event.start).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {event.attendees && event.attendees.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.attendees.length}
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {events.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No upcoming events found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Overview */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Two-way Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Tasks with due dates automatically create calendar events. 
                Changes sync both ways between your todos and calendar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                AI suggests optimal time slots for your tasks based on 
                your calendar availability and productivity patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                View all your calendar events alongside your tasks for 
                better time management and planning.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
