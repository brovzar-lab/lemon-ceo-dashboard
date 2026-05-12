import { useQuery } from '@tanstack/react-query';
import { api, isDemoMode } from '../lib/api';
import { MOCK_EVENTS, MOCK_WEEK_EVENTS } from '../data/mockData';
import type { CalendarEvent, BackendCalendarEvent } from '../types';

function backendToEvent(e: BackendCalendarEvent): CalendarEvent {
  const loc = e.location ?? e.hangout_link ?? '';
  const type = e.hangout_link
    ? 'meeting'
    : loc.toLowerCase().includes('zoom') || loc.toLowerCase().includes('meet')
      ? 'call'
      : 'internal';

  return {
    id: e.id,
    title: e.title,
    startTime: e.start,
    endTime: e.end,
    location: loc,
    type: type as CalendarEvent['type'],
    attendees: e.attendees ?? 1,
    description: e.description ?? '',
  };
}

export function useCalendarToday() {
  return useQuery<CalendarEvent[]>({
    queryKey: ['calendar-today'],
    queryFn: isDemoMode
      ? async () => MOCK_EVENTS
      : async () => {
          const data = await api.get<BackendCalendarEvent[]>('/api/calendar/today');
          return data.map(backendToEvent);
        },
    staleTime: isDemoMode ? Infinity : 300_000,
  });
}

export function useCalendarWeek() {
  return useQuery<CalendarEvent[]>({
    queryKey: ['calendar-week'],
    queryFn: isDemoMode
      ? async () => MOCK_WEEK_EVENTS
      : async () => {
          const data = await api.get<BackendCalendarEvent[]>('/api/calendar/week');
          return data.map(backendToEvent);
        },
    staleTime: isDemoMode ? Infinity : 300_000,
  });
}
