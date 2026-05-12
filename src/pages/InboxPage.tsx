import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MOCK_EMAILS } from '../data/mockData';
import { DemoBadge } from '../components/DemoBadge';
import { SidebarNav } from '../components/SidebarNav';
import { isDemoMode } from '../lib/demo';
import type { Email } from '../types';

type Filter = 'All' | 'Important' | 'Unread';

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = ['bg-teal-700', 'bg-blue-700', 'bg-purple-700', 'bg-rose-700', 'bg-orange-700', 'bg-green-700'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function InboxPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');

  const { data: emails = [] } = useQuery<Email[]>({
    queryKey: ['emails'],
    queryFn: async () => MOCK_EMAILS,
    staleTime: Infinity,
  });

  const filtered = emails.filter((e) => {
    if (filter === 'Important') return e.isImportant;
    if (filter === 'Unread') return !e.isRead;
    return true;
  });

  const selected = emails.find((e) => e.id === selectedId) ?? filtered[0] ?? null;

  const handleToggleImportant = () => {
    if (isDemoMode) {
      toast('Demo mode — changes not saved', { icon: '🔒', style: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' } });
    }
  };

  const tabs: Filter[] = ['All', 'Important', 'Unread'];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <div className="flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <SidebarNav />
      </div>

      {/* Email list */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-800">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-semibold text-slate-100">Inbox</h1>
            {isDemoMode && <DemoBadge />}
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === tab
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {tab === 'Unread' && (
                  <span className="ml-1 text-amber-400">
                    {emails.filter((e) => !e.isRead).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((email) => (
            <button
              key={email.id}
              onClick={() => setSearchParams({ id: email.id })}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800/60 ${
                selected?.id === email.id ? 'bg-slate-800' : !email.isRead ? 'bg-slate-800/30' : ''
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleImportant();
                }}
                className={`mt-0.5 flex-shrink-0 ${
                  email.isImportant ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'
                }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  />
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
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-100 mb-2">{selected.subject}</h2>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${avatarColor(selected.from)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-semibold text-white">{getInitials(selected.from)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{selected.from}</p>
                  <p className="text-xs text-slate-500">{selected.fromEmail} · {selected.company}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleToggleImportant}
                className={selected.isImportant ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}
                aria-label="Toggle important"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xs text-slate-600">{selected.timestamp}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{selected.body}</p>
            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                onClick={handleToggleImportant}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors mr-2"
              >
                Reply
              </button>
              <button
                onClick={handleToggleImportant}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          Select an email to read
        </div>
      )}
    </div>
  );
}
