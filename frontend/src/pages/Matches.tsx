import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getMatches, getSeasons } from '@/services/api';
import type { Match, Season } from '@/types';
import { PageHeader, Card, ErrorState, EmptyState, Pill, Pagination, SkeletonRow } from '@/components/ui';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const limit = 10;

  useEffect(() => {
    getSeasons().then(setSeasons);
  }, []);

  const load = () => {
    setStatus('loading');
    getMatches({ page, limit, search, season })
      .then((res) => {
        setMatches(res.data);
        setTotal(res.pagination.total);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [page, search, season]);

  return (
    <div>
      <PageHeader eyebrow="Fixtures" title="Matches" description="Every match on record, filterable by season and team." />

      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search team, venue, city..."
              className="w-full bg-navy-850 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-electric-500/50"
            />
          </div>
          <select
            value={season ?? ''}
            onChange={(e) => {
              setPage(1);
              setSeason(e.target.value ? Number(e.target.value) : undefined);
            }}
            className="bg-navy-850 border border-navy-700 rounded-lg px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-electric-500/50"
          >
            <option value="">All seasons</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.year}>
                {s.year}
              </option>
            ))}
          </select>
        </div>

        <Card className="overflow-hidden">
          {status === 'loading' && (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {status === 'error' && <ErrorState onRetry={load} />}

          {status === 'ready' && matches.length === 0 && (
            <EmptyState title="No matches found" description="Try a different search term or season." />
          )}

          {status === 'ready' && matches.length > 0 && (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-700 text-left text-[11px] font-mono tracking-wide text-ink-500 uppercase">
                    <th className="px-5 py-3 font-medium">Fixture</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Venue</th>
                    <th className="px-5 py-3 font-medium">Season</th>
                    <th className="px-5 py-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-b border-navy-800 last:border-0 hover:bg-navy-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-ink-100 font-medium">
                        {m.teamA} <span className="text-ink-500 font-normal">vs</span> {m.teamB}
                      </td>
                      <td className="px-5 py-3.5 text-ink-300 font-mono text-xs">{m.date}</td>
                      <td className="px-5 py-3.5 text-ink-300">
                        {m.venue} <span className="text-ink-500">· {m.city}</span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-300">{m.season}</td>
                      <td className="px-5 py-3.5">
                        {m.winner ? (
                          <Pill tone="flood">
                            {m.winner} won by {m.winMargin}
                          </Pill>
                        ) : (
                          <Pill tone="stump">No result</Pill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5">
                <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
