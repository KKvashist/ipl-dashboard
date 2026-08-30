import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { getTeams, getSeasonTrend } from '@/services/api';
import type { Team, SeasonRunsTrend } from '@/types';
import { PageHeader, Card, LoadingState, ErrorState } from '@/components/ui';

export default function Analytics() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [trend, setTrend] = useState<SeasonRunsTrend[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = () => {
    setStatus('loading');
    Promise.all([getTeams(), getSeasonTrend()])
      .then(([t, tr]) => {
        setTeams(t);
        setTrend(tr);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  if (status === 'loading') return <LoadingState label="Crunching numbers" />;
  if (status === 'error') return <ErrorState onRetry={load} />;

  const winsData = [...teams].sort((a, b) => b.wins - a.wins).slice(0, 8);
  const titlesData = teams.filter((t) => t.titles > 0);

  return (
    <div>
      <PageHeader eyebrow="Deep Dive" title="Analytics" description="Franchise performance and season-over-season trends." />

      <div className="p-8 space-y-5">
        <Card className="p-6">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="font-display text-lg text-ink-100">Team Wins</h3>
            <span className="text-[11px] font-mono text-ink-500">ALL-TIME</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={winsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232937" vertical={false} />
              <XAxis dataKey="shortName" tick={{ fill: '#8B93A7', fontSize: 11 }} axisLine={{ stroke: '#232937' }} tickLine={false} />
              <YAxis tick={{ fill: '#8B93A7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#12161F', border: '1px solid #232937', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#F5F6F8' }}
                cursor={{ fill: '#171C27' }}
              />
              <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
                {winsData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-display text-lg text-ink-100">Title Distribution</h3>
              <span className="text-[11px] font-mono text-ink-500">CHAMPIONSHIPS</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={titlesData} dataKey="titles" nameKey="shortName" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {titlesData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#12161F', border: '1px solid #232937', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8B93A7' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-display text-lg text-ink-100">Wickets per Season</h3>
              <span className="text-[11px] font-mono text-ink-500">TREND</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232937" vertical={false} />
                <XAxis dataKey="season" tick={{ fill: '#8B93A7', fontSize: 11 }} axisLine={{ stroke: '#232937' }} tickLine={false} />
                <YAxis tick={{ fill: '#8B93A7', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#12161F', border: '1px solid #232937', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#F5F6F8' }}
                />
                <Line type="monotone" dataKey="totalWickets" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: '#FF6B35', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
