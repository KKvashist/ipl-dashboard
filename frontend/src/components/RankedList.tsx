import { TrendingUp, TrendingDown } from 'lucide-react';

export interface RankedItem {
  name: string;
  subtitle: string;
  value: string | number;
  trend?: 'up' | 'down';
}

export default function RankedList({ items, accent = '#2F7BFF' }: { items: RankedItem[]; accent?: string }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={item.name} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-navy-800/60 transition-colors">
          <div className="w-6 text-center text-xs font-mono text-ink-500">{i + 1}</div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-navy-950 shrink-0"
            style={{ backgroundColor: accent }}
          >
            {item.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-ink-100 font-medium truncate">{item.name}</div>
            <div className="text-xs text-ink-500 truncate">{item.subtitle}</div>
          </div>
          <div className="text-sm font-mono text-ink-100">{item.value}</div>
          {item.trend && (item.trend === 'up'
            ? <TrendingUp size={14} className="text-emerald-400" />
            : <TrendingDown size={14} className="text-stump-500" />)}
        </div>
      ))}
    </div>
  );
}