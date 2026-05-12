import { useQuery } from '@tanstack/react-query';
import { api, isDemoMode } from '../lib/api';
import type { AuthUser } from '../types';

const DEMO_USER: AuthUser = {
  email: 'demo@lemonfilms.com',
  name: 'Demo User',
};

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ['auth-me'],
    queryFn: isDemoMode
      ? async () => null
      : async () => {
          try {
            return await api.get<AuthUser>('/auth/me');
          } catch {
            return null;
          }
        },
    staleTime: 300_000,
    retry: false,
  });
}

export function signInWithGoogle() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';
  window.location.href = `${backendUrl}/auth/google`;
}

export async function signOut() {
  if (!isDemoMode) {
    await api.post('/auth/logout');
  }
  window.location.href = '/login';
}

export { DEMO_USER };
