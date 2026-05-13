import type { EmailAI, EmailCategory } from '../types';

const CATEGORY_LABELS: Record<EmailCategory, string> = {
  deal: 'Deal',
  crew: 'Crew',
  legal: 'Legal',
  vendor: 'Vendor',
  personal: 'Personal',
  other: 'Other',
};

const CATEGORY_COLORS: Record<EmailCategory, string> = {
  deal: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40',
  crew: 'bg-blue-900/50 text-blue-300 border border-blue-700/40',
  legal: 'bg-orange-900/50 text-orange-300 border border-orange-700/40',
  vendor: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',
  personal: 'bg-purple-900/50 text-purple-300 border border-purple-700/40',
  other: 'bg-slate-800/60 text-slate-400 border border-slate-700/40',
};

function priorityBadgeClass(score: number) {
  if (score >= 8) return 'bg-red-900/60 text-red-300 border border-red-700/40';
  if (score >= 5) return 'bg-amber-900/60 text-amber-300 border border-amber-700/40';
  return 'bg-slate-800/60 text-slate-500 border border-slate-700/40';
}

export function urgencyBarClass(score: number) {
  if (score >= 8) return 'bg-red-500';
  if (score >= 5) return 'bg-amber-500';
  return 'bg-slate-600';
}

function AISummarySkeleton() {
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="h-2.5 bg-slate-700/50 rounded animate-pulse w-4/5" />
      <div className="h-2.5 bg-slate-700/50 rounded animate-pulse w-3/5" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-4 w-10 bg-slate-700/50 rounded-full animate-pulse" />
        <div className="h-4 w-14 bg-slate-700/50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

interface EmailAISummaryProps {
  ai: EmailAI | null | undefined;
  isLoading: boolean;
}

export function EmailAISummary({ ai, isLoading }: EmailAISummaryProps) {
  if (isLoading) return <AISummarySkeleton />;
  if (!ai) return null;

  return (
    <div className="mt-1.5">
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{ai.summary}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${priorityBadgeClass(ai.priorityScore)}`}>
          P{ai.priorityScore}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[ai.category]}`}>
          {CATEGORY_LABELS[ai.category]}
        </span>
      </div>
    </div>
  );
}

interface EmailAIActionItemsProps {
  ai: EmailAI | null | undefined;
  isLoading: boolean;
}

function ActionItemsSkeleton() {
  return (
    <div className="mb-5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
      <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse mb-3" />
      {[80, 65, 70].map((w, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <div className="h-3 w-3 rounded-sm bg-slate-700/50 animate-pulse flex-shrink-0" />
          <div className={`h-2.5 bg-slate-700/50 rounded animate-pulse`} style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

export function EmailAIActionItems({ ai, isLoading }: EmailAIActionItemsProps) {
  if (isLoading) return <ActionItemsSkeleton />;
  if (!ai || ai.actionItems.length === 0) return null;

  return (
    <div className="mb-5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
      <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
        <span className="text-teal-400">✦</span> AI Action Items
      </p>
      <ul className="space-y-1.5">
        {ai.actionItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              className="mt-0.5 flex-shrink-0 accent-teal-500 cursor-pointer"
              readOnly
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
