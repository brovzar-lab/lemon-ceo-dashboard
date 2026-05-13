import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getMockDraft } from '../data/mockData';
import { isDemoMode } from '../lib/demo';
import { api } from '../lib/api';
import type { Email } from '../types';

interface Props {
  email: Email;
  onClose: () => void;
}

const STREAM_INTERVAL_MS = 12;

function useStreamingText(fullText: string, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    setDone(false);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 3;
      if (idx >= fullText.length) {
        setDisplayed(fullText);
        setDone(true);
        clearInterval(intervalRef.current!);
      } else {
        setDisplayed(fullText.slice(0, idx));
      }
    }, STREAM_INTERVAL_MS);
    return () => clearInterval(intervalRef.current!);
  }, [fullText, active]);

  return { displayed, done };
}

export function DraftReplyPanel({ email, onClose }: Props) {
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [generation, setGeneration] = useState(0);
  const { displayed, done } = useStreamingText(draft, streaming);

  const generateDraft = async (ctx: string) => {
    setStreaming(false);
    setDraft('');
    if (isDemoMode) {
      const base = getMockDraft(email.id);
      const full = ctx.trim()
        ? `[Note: ${ctx.trim()}]\n\n${base}`
        : base;
      setDraft(full);
      setStreaming(true);
    } else {
      try {
        const data = await api.post<{ draft: string }>(`/api/emails/${email.id}/draft-reply`, {
          context: ctx.trim(),
        });
        setDraft(data.draft);
        setStreaming(true);
      } catch {
        toast.error('Could not generate draft — try again');
      }
    }
  };

  useEffect(() => {
    generateDraft(context);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  const handleRegenerate = () => {
    setGeneration((g) => g + 1);
  };

  const handleCopyToGmail = () => {
    const text = done ? draft : displayed;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Draft copied to clipboard');
    });
    const subject = encodeURIComponent(`Re: ${email.subject}`);
    const body = encodeURIComponent(text);
    window.open(
      `https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}`,
      '_blank',
    );
  };

  const visibleText = streaming ? displayed : draft;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-[480px] flex-shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Draft Reply</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[320px]">{email.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Context input */}
        <div className="px-5 py-3 border-b border-slate-800">
          <label className="block text-xs text-slate-400 mb-1.5">
            Guide the reply <span className="text-slate-600">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegenerate(); }}
              placeholder='e.g. "decline politely" or "suggest Tuesday"'
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Draft area */}
        <div className="flex-1 px-5 py-4 overflow-hidden flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="text-teal-400">✦</span> AI Draft
            </span>
            {streaming && !done && (
              <span className="text-[10px] text-teal-400 animate-pulse">generating…</span>
            )}
          </div>
          <textarea
            value={visibleText}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-slate-600 font-mono"
            placeholder="Generating draft…"
          />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={streaming && !done}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            Regenerate
          </button>
          <button
            onClick={handleCopyToGmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-medium transition-colors ml-auto"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
            Copy to Gmail
          </button>
        </div>
      </div>
    </div>
  );
}
