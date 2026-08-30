import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="px-8 pt-10 pb-6 border-b border-navy-800">
      <div className="text-[11px] font-mono tracking-[0.2em] text-electric-500 mb-2">{eyebrow}</div>
      <h1 className="font-display text-3xl text-ink-100 tracking-tight">{title}</h1>
      {description && <p className="text-ink-500 text-sm mt-2 max-w-xl">{description}</p>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-navy-850 border border-navy-700 rounded-xl ${className}`}>{children}</div>;
}

export function StatTile({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="text-[11px] font-mono tracking-[0.15em] text-ink-500 uppercase mb-2">{label}</div>
      <div className="font-display text-3xl text-ink-100">{value}</div>
      {sublabel && <div className="text-xs text-ink-500 mt-1">{sublabel}</div>}
    </Card>
  );
}

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-ink-500">
      <div className="w-8 h-8 border-2 border-navy-700 border-t-electric-500 rounded-full animate-spin mb-4" />
      <div className="text-sm font-mono tracking-wide">{label}...</div>
    </div>
  );
}

export function SkeletonRow() {
  return <div className="h-12 bg-navy-800 rounded-lg animate-pulse" />;
}

export function EmptyState({ title = 'No results', description = 'Try adjusting your filters.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-navy-800 flex items-center justify-center mb-4">
        <Inbox size={20} className="text-ink-500" />
      </div>
      <div className="text-ink-100 font-medium mb-1">{title}</div>
      <div className="text-ink-500 text-sm max-w-sm">{description}</div>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-stump-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-stump-500" />
      </div>
      <div className="text-ink-100 font-medium mb-1">Couldn't load this</div>
      <div className="text-ink-500 text-sm max-w-sm mb-5">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-ink-100 text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'flood' | 'stump' }) {
 const tones = {
  default: 'bg-navy-700 text-ink-300',
  flood: 'bg-emerald-500/15 text-emerald-400',
  stump: 'bg-stump-500/15 text-stump-500',
};
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-1 py-4 text-sm">
      <div className="text-ink-500">
        Showing <span className="text-ink-300">{start}–{end}</span> of <span className="text-ink-300">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-md bg-navy-800 text-ink-300 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-700 transition-colors"
        >
          Prev
        </button>
        <span className="text-ink-500 text-xs font-mono px-2">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-md bg-navy-800 text-ink-300 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
