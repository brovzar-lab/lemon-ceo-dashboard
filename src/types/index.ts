export type EmailCategory = 'deal' | 'crew' | 'legal' | 'vendor' | 'personal' | 'other';

export interface EmailAI {
  summary: string;
  priorityScore: number;
  priorityReason: string;
  actionItems: string[];
  category: EmailCategory;
}

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

// Backend API response shapes (snake_case from FastAPI)
export interface BackendEmail {
  id: string;
  from: string;
  from_email: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  is_important: boolean;
  is_read: boolean;
}

export interface BackendCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendees?: number;
  description?: string;
  hangout_link?: string;
}

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
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
