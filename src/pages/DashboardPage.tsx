import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DemoBadge } from '../components/DemoBadge';
import { SidebarNav } from '../components/SidebarNav';
import { DailyBriefing } from '../components/DailyBriefing';
import { EmailAISummary, urgencyBarClass } from '../components/EmailAISummary';
import { isDemoMode } from '../lib/demo';
import { useEmails } from '../hooks/useEmails';
import { useEmailsAIAll } from '../hooks/useEmailAI';
import { useCalendarToday } from '../hooks/useCalendar';
import type { Email, CalendarEvent } from '../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function eventColor(type: CalendarEvent['type']) {
  const map: Record<CalendarEvent['type'], string> = {
    call: 'bg-teal-500/20 border-teal-500/50 text-teal-300',
    meeting: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    lunch: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
    internal: 'bg-slate-600/40 border-slate-500/50 text-slate-300',
    dinner: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  };
  return map[type];
}

interface PriorityEmailRowProps {
  email: Email;
  onToggleImportant: (id: string) => void;
  aiData: Record<string, import('../types').EmailAI> | undefined;
  aiLoading: boolean;
}

function PriorityEmailRow({ email, onToggleImportant, aiData, aiLoading }: PriorityEmailRowProps) {
  const ai = aiData?.[email.id];

  return (
    <Link
      to={`/inbox?id=${email.id}`}
      className={`relative flex items-start gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors border-b border-slate-800/60 ${
        !email.isRead ? 'bg-slate-800/30' : ''
      }`}
    >
      {ai && (
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${urgencyBarClass(ai.priorityScore)}`} />
      )}
      <button
        onClick={(e) => { e.preventDefault(); onToggleImportant(email.id); }}
        className={`mt-0.5 flex-shrink-0 ${email.isImportant ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'}`}
        aria-label={email.isImportant ? 'Mark not important' : 'Mark important'}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
            {email.from}
          </span>
          <span className="text-xs text-slate-600 flex-shrink-0">{email.timestamp}</span>
        </div>
        <p className={`text-xs truncate ${!email.isRead ? 'text-slate-300' : 'text-slate-500'}`}>{email.subject}</p>
        <EmailAISummary ai={ai} isLoading={aiLoading && !ai} />
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { data: emails = [] } = useEmails();
  const { data: aiAll, isLoading: aiLoading } = useEmailsAIAll();
  const { data: events = [] } = useCalendarToday();

  const handleToggleImportant = () => {
    if (isDemoMode) {
      toast('Demo mode — changes not saved', { icon: '🔒', style: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' } });
    }
  };

  const priorityEmails = aiAll
    ? [...emails.filter((e) => e.isImportant)]
        .sort((a, b) => (aiAll[b.id]?.priorityScore ?? 0) - (aiAll[a.id]?.priorityScore ?? 0))
        .slice(0, 8)
    : emails.filter((e) => e.isImportant).slice(0, 8);

  const unreadCount = emails.filter((e) => !e.isRead).length;
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Slim icon sidebar */}
      <div className="flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <SidebarNav />
      </div>

      {/* Center: Priority Inbox */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Priority Inbox</h2>
            <p className="text-xs text-slate-500">{unreadCount} unread · AI sorted</p>
          </div>
          <Link to="/inbox" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {priorityEmails.map((email) => (
            <PriorityEmailRow
              key={email.id}
              email={email}
              onToggleImportant={handleToggleImportant}
              aiData={aiAll}
              aiLoading={aiLoading}
            />
          ))}
        </div>
      </div>

      {/* Right: Daily Briefing + Today's Calendar */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Today</h2>
            <p className="text-xs text-slate-500">{todayStr}</p>
          </div>
          <div className="flex items-center gap-2">
            {isDemoMode && <DemoBadge />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DailyBriefing />

          <div className="px-3 py-3 space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">Schedule</p>
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/calendar?id=${event.id}`}
                className={`block px-3 py-2.5 rounded-lg border text-left transition-opacity hover:opacity-80 ${eventColor(event.type)}`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium truncate">{formatTime(event.startTime)}</span>
                  {event.attendees > 1 && (
                    <span className="text-xs opacity-70 flex-shrink-0">{event.attendees} people</span>
                  )}
                </div>
                <p className="text-xs font-semibold leading-tight">{event.title}</p>
                <p className="text-xs opacity-60 mt-0.5 truncate">{event.location}</p>
              </Link>
            ))}
            <Link
              to="/calendar"
              className="block text-center text-xs text-slate-600 hover:text-slate-400 pt-1 transition-colors"
            >
              Full calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
