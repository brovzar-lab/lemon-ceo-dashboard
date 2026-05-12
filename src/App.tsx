import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InboxPage } from './pages/InboxPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { isDemoMode } from './lib/demo';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();

  if (isDemoMode) return <>{children}</>;
  if (isLoading) {
    return (
      <div className="h-screen bg-[#09090d] flex items-center justify-center">
        <span className="text-slate-500 text-sm">Loading…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={isDemoMode ? '/login' : '/dashboard'} replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
