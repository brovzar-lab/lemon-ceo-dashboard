export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  company: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  isImportant: boolean;
  isRead: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'call' | 'meeting' | 'lunch' | 'internal' | 'dinner';
  attendees: number;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  phase: 'Writing' | 'Development' | 'Pre-Production' | 'Production' | 'Post';
  director: string;
  role: string;
  status: 'active' | 'hold' | 'review';
  lastUpdated: string;
  budget: string;
  logline: string;
}
