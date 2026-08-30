import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getTeams } from '@/services/api';
import type { Team } from '@/types';
import { PageHeader, Card, LoadingState, ErrorState, EmptyState } from '@/components/ui';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = () => {
    setStatus('loading');
    getTeams()
      .then((data) => {
        setTeams(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  return (
    <div>
      <PageHeader eyebrow="Franchises" title="Teams" description="Franchise records across every season played." />

      <div className="p-8">
        {status === 'loading' && <LoadingState label="Loading teams" />}
        {status === 'error' && <ErrorState onRetry={load} />}
        {status === 'ready' && teams.length === 0 && <EmptyState title="No teams found" />}

        {status === 'ready' && teams.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => {
              const winPct = Math.round((t.wins / t.matchesPlayed) * 100);
              return (
                <Card key={t.id} className="p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: t.color }} />
                  <div className="flex items-start justify-between mb-4 pl-2">
                    <div>
                      <div className="text-ink-100 font-medium">{t.name}</div>
                      <div className="text-ink-500 text-xs font-mono mt-0.5">{t.shortName}</div>
                    </div>
                    {t.titles > 0 && (
                      <div className="flex items-center gap-1 text-electric-500 text-xs font-medium">
                        <Trophy size={13} /> {t.titles}
                      </div>
                    )}
                  </div>

                  <div className="pl-2 mb-3">
                    <div className="flex justify-between text-xs text-ink-500 mb-1.5">
                      <span>Win rate</span>
                      <span className="text-ink-300 font-mono">{winPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${winPct}%`, backgroundColor: t.color }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pl-2 pt-3 border-t border-navy-700 text-xs">
                    <div>
                      <div className="text-ink-500">Played</div>
                      <div className="text-ink-100 font-mono">{t.matchesPlayed}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">Won</div>
                      <div className="text-ink-100 font-mono">{t.wins}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">Lost</div>
                      <div className="text-ink-100 font-mono">{t.losses}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
