import { useQuery } from '@tanstack/react-query';
import { api, isDemoMode } from '../lib/api';
import { MOCK_EMAIL_AI } from '../data/mockData';
import type { EmailAI } from '../types';

export function useEmailsAIAll() {
  return useQuery<Record<string, EmailAI>>({
    queryKey: ['emails-ai-all'],
    queryFn: isDemoMode
      ? async () => {
          await new Promise((r) => setTimeout(r, 900));
          return MOCK_EMAIL_AI;
        }
      : async () => api.get<Record<string, EmailAI>>('/api/emails/ai'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmailAI(emailId: string | null) {
  return useQuery<EmailAI | null>({
    queryKey: ['email-ai', emailId],
    queryFn: isDemoMode
      ? async () => {
          await new Promise((r) => setTimeout(r, 700));
          return MOCK_EMAIL_AI[emailId!] ?? null;
        }
      : async () => {
          if (!emailId) return null;
          return api.get<EmailAI>(`/api/emails/${emailId}/ai`);
        },
    enabled: !!emailId,
    staleTime: 5 * 60 * 1000,
  });
}
