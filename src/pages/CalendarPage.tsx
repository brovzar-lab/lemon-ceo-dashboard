import { useSearchParams } from 'react-router-dom';
import { DemoBadge } from '../components/DemoBadge';
import { SidebarNav } from '../components/SidebarNav';
import { isDemoMode } from '../lib/demo';
import { useCalendarWeek } from '../hooks/useCalendar';
import type { CalendarEvent } from '../types';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8am–9pm

function formatHour(h: number) {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function eventColor(type: CalendarEvent['type']) {
  const map: Record<CalendarEvent['type'], string> = {
    call: 'bg-teal-500/20 border-teal-500 text-teal-200',
    meeting: 'bg-blue-500/20 border-blue-500 text-blue-200',
    lunch: 'bg-orange-500/20 border-orange-500 text-orange-200',
    internal: 'bg-slate-600/50 border-slate-500 text-slate-200',
    dinner: 'bg-purple-500/20 border-purple-500 text-purple-200',
  };
  return map[type];
}

function getWeekDays(base: Date) {
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getEventTop(startIso: string) {
  const d = new Date(startIso);
  const minutesFromStart = (d.getHours() - 8) * 60 + d.getMinutes();
  return (minutesFromStart / 60) * 56; // 56px per hour
}

function getEventHeight(startIso: string, endIso: string) {
  const duration = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000;
  return Math.max((duration / 60) * 56, 32);
}

export function CalendarPage() {
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');

  const { data: events = [] } = useCalendarWeek();

  const weekDays = getWeekDays(today);
  const selected = events.find((e) => e.id === selectedId);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <div className="flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Calendar</h1>
            <p className="text-xs text-slate-500">
              Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          {isDemoMode && <DemoBadge />}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Week grid */}
          <div className="flex-1 overflow-auto">
            {/* Day headers */}
            <div className="flex border-b border-slate-800 sticky top-0 bg-slate-950 z-10">
              <div className="w-16 flex-shrink-0" />
              {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-slate-800">
                    <p className="text-xs text-slate-500">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-sm font-semibold mt-0.5 w-7 h-7 mx-auto rounded-full flex items-center justify-center ${
                      isToday ? 'bg-amber-400 text-slate-900' : 'text-slate-200'
                    }`}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="flex relative">
              {/* Hour labels */}
              <div className="w-16 flex-shrink-0">
                {HOURS.map((h) => (
                  <div key={h} className="h-14 flex items-start justify-end pr-3 pt-0.5">
                    <span className="text-xs text-slate-600">{formatHour(h)}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day));
                return (
                  <div key={day.toISOString()} className="flex-1 border-l border-slate-800 relative">
                    {HOURS.map((h) => (
                      <div key={h} className="h-14 border-b border-slate-800/40" />
                    ))}
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSearchParams({ id: event.id })}
                        style={{
                          top: getEventTop(event.startTime),
                          height: getEventHeight(event.startTime, event.endTime),
                        }}
                        className={`absolute inset-x-0.5 rounded border-l-2 px-1.5 py-1 text-left overflow-hidden transition-opacity hover:opacity-80 ${eventColor(event.type)} ${
                          selectedId === event.id ? 'ring-1 ring-white/20' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold leading-tight truncate">{event.title}</p>
                        <p className="text-xs opacity-70 truncate">{formatTime(event.startTime)}</p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event detail panel */}
          {selected && (
            <div className="w-72 flex-shrink-0 border-l border-slate-800 flex flex-col">
              <div className="px-4 py-4 border-b border-slate-800 flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-100 leading-tight flex-1">{selected.title}</h2>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-slate-600 hover:text-slate-400 flex-shrink-0"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-600 flex-shrink-0">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formatTime(selected.startTime)} – {formatTime(selected.endTime)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-600 flex-shrink-0">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {selected.location}
                  </div>
                  {selected.attendees > 1 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-600 flex-shrink-0">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {selected.attendees} attendees
                    </div>
                  )}
                </div>
                {selected.description && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-400 leading-relaxed">{selected.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
