import { useQuery } from '@tanstack/react-query';
import { api, isDemoMode } from '../lib/api';
import { MOCK_EMAILS } from '../data/mockData';
import type { Email, BackendEmail } from '../types';

function backendToEmail(e: BackendEmail): Email {
  const d = new Date(e.date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3_600_000;

  let timestamp: string;
  if (diffH < 24 && d.getDate() === now.getDate()) {
    timestamp = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffH < 48) {
    timestamp = 'Yesterday';
  } else {
    timestamp = d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return {
    id: e.id,
    from: e.from,
    fromEmail: e.from_email,
    company: e.from_email.split('@')[1] ?? '',
    subject: e.subject,
    snippet: e.snippet,
    body: e.body,
    timestamp,
    isImportant: e.is_important,
    isRead: e.is_read,
  };
}

export function useEmails() {
  return useQuery<Email[]>({
    queryKey: ['emails'],
    queryFn: isDemoMode
      ? async () => MOCK_EMAILS
      : async () => {
          const data = await api.get<BackendEmail[]>('/api/emails?limit=50');
          return data.map(backendToEmail);
        },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}

export function useImportantEmails() {
  return useQuery<Email[]>({
    queryKey: ['emails-important'],
    queryFn: isDemoMode
      ? async () => MOCK_EMAILS.filter((e) => e.isImportant)
      : async () => {
          const data = await api.get<BackendEmail[]>('/api/emails/important');
          return data.map(backendToEmail);
        },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}

export function useEmail(id: string | null) {
  return useQuery<Email | null>({
    queryKey: ['email', id],
    queryFn: isDemoMode
      ? async () => MOCK_EMAILS.find((e) => e.id === id) ?? null
      : async () => {
          if (!id) return null;
          const data = await api.get<BackendEmail>(`/api/emails/${id}`);
          return backendToEmail(data);
        },
    enabled: !!id,
    staleTime: isDemoMode ? Infinity : 300_000,
  });
}
