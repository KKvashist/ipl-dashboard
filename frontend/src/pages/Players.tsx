import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getPlayers, getTeams } from '@/services/api';
import type { Player, Team } from '@/types';
import { PageHeader, Card, ErrorState, EmptyState, Pill, Pagination, SkeletonRow } from '@/components/ui';

// NOTE: "Wicketkeeper" removed on purpose. The backend's classifyRole()
// (players.ts) only ever assigns Batter / Bowler / All-rounder — the schema
// has no field indicating who kept wicket, so wicketkeeper status is never
// derived (see the comment at the top of players.ts). Keeping this option
// here would give users a filter that always returns zero results.
const roles = ['Batter', 'Bowler', 'All-rounder'];

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState('');
  const [sortBy, setSortBy] = useState<'runs' | 'wickets' | 'battingAverage' | 'strikeRate'>('runs');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const limit = 12;

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const load = () => {
    setStatus('loading');
    getPlayers({ page, limit, search, role: role || undefined, team: team || undefined, sortBy })
      .then((res) => {
        setPlayers(res.data);
        setTotal(res.pagination.total);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [page, search, role, team, sortBy]);

  return (
    <div>
      <PageHeader eyebrow="Roster" title="Players" description="Batting and bowling statistics across every player on record." />

      <div className="p-8">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search player..."
              className="w-full bg-navy-850 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-electric-500/50"
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="bg-navy-850 border border-navy-700 rounded-lg px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-electric-500/50"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={team}
            onChange={(e) => {
              setPage(1);
              setTeam(e.target.value);
            }}
            className="bg-navy-850 border border-navy-700 rounded-lg px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-electric-500/50"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.shortName}>
                {t.shortName}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setPage(1);
              setSortBy(e.target.value as typeof sortBy);
            }}
            className="bg-navy-850 border border-navy-700 rounded-lg px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-electric-500/50"
          >
            <option value="runs">Sort: Runs</option>
            <option value="wickets">Sort: Wickets</option>
            <option value="battingAverage">Sort: Batting Avg</option>
            <option value="strikeRate">Sort: Strike Rate</option>
          </select>
        </div>

        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <Card>
            <ErrorState onRetry={load} />
          </Card>
        )}

        {status === 'ready' && players.length === 0 && (
          <Card>
            <EmptyState title="No players found" description="Try a different search term or filter." />
          </Card>
        )}

        {status === 'ready' && players.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => (
                <Card key={p.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-ink-100 font-medium">{p.name}</div>
                      <div className="text-ink-500 text-xs mt-0.5">{p.team}</div>
                    </div>
                    <Pill>{p.role}</Pill>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs mt-4 pt-4 border-t border-navy-700">
                    <div>
                      <div className="text-ink-500">Matches</div>
                      <div className="text-ink-100 font-mono">{p.matches}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">Runs</div>
                      <div className="text-ink-100 font-mono">{p.runs.toLocaleString()}</div>
                    </div>
                    {p.battingAverage !== null && (
                      <div>
                        <div className="text-ink-500">Avg</div>
                        <div className="text-ink-100 font-mono">{p.battingAverage}</div>
                      </div>
                    )}
                    {p.strikeRate !== null && (
                      <div>
                        <div className="text-ink-500">SR</div>
                        <div className="text-ink-100 font-mono">{p.strikeRate}</div>
                      </div>
                    )}
                    {p.wickets > 0 && (
                      <div>
                        <div className="text-ink-500">Wickets</div>
                        <div className="text-ink-100 font-mono">{p.wickets}</div>
                      </div>
                    )}
                    {p.economy !== null && (
                      <div>
                        <div className="text-ink-500">Econ</div>
                        <div className="text-ink-100 font-mono">{p.economy}</div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
