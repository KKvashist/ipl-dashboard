import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';

export interface LeaderboardEntry {
  name: string;
  subtitle: string;
  value: number;
  displayValue: string;
}

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Leaderboard({
  entries,
  accent = '#2F7BFF',
  accentSoft = '#6FA8FF',
}: {
  entries: LeaderboardEntry[];
  accent?: string;
  accentSoft?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...entries.map((e) => e.value), 1);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const pct = (entry.value / max) * 100;
        const isTop = i === 0;

        return (
          <div key={entry.name} className="group relative">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-6 flex items-center justify-center shrink-0">
                {i < 3 ? (
                  <Crown size={14} style={{ color: medalColors[i] }} fill={medalColors[i]} />
                ) : (
                  <span className="text-[11px] font-mono text-ink-700">{i + 1}</span>
                )}
              </div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-navy-950 shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${accentSoft}, ${accent})`,
                  boxShadow: isTop ? `0 0 16px -2px ${accent}99` : 'none',
                }}
              >
                {entry.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink-100 font-medium truncate">{entry.name}</div>
                <div className="text-[11px] text-ink-500 truncate">{entry.subtitle}</div>
              </div>

              <div
                className="font-display text-base shrink-0"
                style={{ color: isTop ? accentSoft : '#F5F7FA' }}
              >
                {entry.displayValue}
              </div>
            </div>

            <div className="h-2 rounded-full bg-navy-800 overflow-hidden ml-9">
              <div
                className="h-full rounded-full transition-all ease-out"
                style={{
                  width: mounted ? `${pct}%` : '0%',
                  transitionDuration: `${800 + i * 100}ms`,
                  background: `linear-gradient(90deg, ${accentSoft}, ${accent})`,
                  boxShadow: isTop ? `0 0 12px -1px ${accent}aa` : 'none',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}