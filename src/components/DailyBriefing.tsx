import { useState } from 'react';
import { useEmailsAIAll } from '../hooks/useEmailAI';
import { useCalendarToday } from '../hooks/useCalendar';
import { useEmails } from '../hooks/useEmails';
import type { CalendarEvent } from '../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function calendarNote(event: CalendarEvent): string {
  const noteMap: Record<string, string> = {
    'Weekly Production Sync': 'Prep: Last Reel wrap status + Desert Protocol pre-production update.',
    "Lunch w/ James Cameron's producer": "Context: potential co-production. Don't commit — listen first.",
    'Script Review: Neon Sunset Act II': 'James sent the revision this morning. Worth a quick skim before.',
    'Call with CAA — Casting': 'CAA presenting revised Desert Protocol shortlist — three A-list options.',
    'Lemon Films Board Dinner': 'Q1 debrief. Budget is healthy. Dress: business casual.',
  };
  return noteMap[event.title] ?? 'Review notes before attending.';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function BriefingSkeleton() {
  return (
    <div className="space-y-2 p-3">
      <div className="h-3 bg-slate-700/50 rounded animate-pulse w-2/3" />
      <div className="h-2.5 bg-slate-700/50 rounded animate-pulse w-full mt-2" />
      <div className="h-2.5 bg-slate-700/50 rounded animate-pulse w-5/6" />
      <div className="h-2.5 bg-slate-700/50 rounded animate-pulse w-4/5" />
    </div>
  );
}

export function DailyBriefing() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());

  const { data: emails = [], isLoading: emailsLoading } = useEmails();
  const { data: aiAll, isLoading: aiLoading } = useEmailsAIAll();
  const { data: events = [] } = useCalendarToday();

  const isLoading = emailsLoading || aiLoading;

  const urgentEmails = emails
    .filter((e) => aiAll && (aiAll[e.id]?.priorityScore ?? 0) >= 8)
    .sort((a, b) => (aiAll?.[b.id]?.priorityScore ?? 0) - (aiAll?.[a.id]?.priorityScore ?? 0))
    .slice(0, 4);

  const topEmails = emails
    .filter((e) => aiAll && (aiAll[e.id]?.priorityScore ?? 0) >= 5)
    .sort((a, b) => (aiAll?.[b.id]?.priorityScore ?? 0) - (aiAll?.[a.id]?.priorityScore ?? 0))
    .slice(0, 4);

  const todayEvents = events.slice(0, 3);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(new Date());
  };

  void refreshKey;

  const formatRefreshed = () => {
    return lastRefreshed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="border-b border-slate-800 pb-3">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-teal-400 text-sm">✦</span>
          <h3 className="text-xs font-semibold text-slate-200">Daily Briefing</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">{formatRefreshed()}</span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-40"
            aria-label="Refresh briefing"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 01.75.75v3.182a.75.75 0 01-.75.75h-3.182a.75.75 0 010-1.5h1.37l-.84-.841a4.5 4.5 0 00-7.08 1.01.75.75 0 01-1.323-.708 6 6 0 019.44-1.344l.895.895V3.227a.75.75 0 01.75-.75zm-.978 8.708a.75.75 0 01-.09 1.057A6 6 0 012.23 10.897l-.894-.894v1.363a.75.75 0 01-1.5 0V8.184a.75.75 0 01.75-.75h3.181a.75.75 0 010 1.5H2.4l.84.841a4.5 4.5 0 007.08-1.01.75.75 0 011.539.422z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <BriefingSkeleton />
      ) : (
        <div className="px-4 space-y-3">
          <p className="text-xs text-slate-300">
            {getGreeting()}, Billy — here's what matters today.
          </p>

          {/* Urgent items */}
          {urgentEmails.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Urgent</p>
              <ul className="space-y-1">
                {urgentEmails.map((e) => (
                  <li key={e.id} className="flex items-start gap-1.5 text-xs">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                    <span className="text-slate-300">
                      <span className="font-medium">{e.from}</span>
                      {' — '}{aiAll?.[e.id]?.summary ?? e.snippet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email digest */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email digest</p>
            <ul className="space-y-1">
              {topEmails.filter((e) => !urgentEmails.find((u) => u.id === e.id)).slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-start gap-1.5 text-xs">
                  <span className="text-slate-600 flex-shrink-0 mt-0.5">·</span>
                  <span className="text-slate-400">
                    <span className="text-slate-300 font-medium">{e.from}</span>
                    {' — '}{aiAll?.[e.id]?.summary ?? e.snippet}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calendar prep */}
          {todayEvents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Calendar prep</p>
              <ul className="space-y-1">
                {todayEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-1.5 text-xs">
                    <span className="text-slate-600 flex-shrink-0 mt-0.5 font-mono text-[10px]">{formatTime(ev.startTime)}</span>
                    <span className="text-slate-400">{calendarNote(ev)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested focus */}
          <div className="bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30">
            <p className="text-[10px] font-semibold text-teal-400 mb-0.5">Suggested focus</p>
            <p className="text-xs text-slate-300">
              Respond to Sarah Chen on distribution rights — this is the highest-leverage action today. Everything else can wait until after the board dinner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
