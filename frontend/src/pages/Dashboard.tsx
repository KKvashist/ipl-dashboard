import { useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

import {
  getDashboardSummary,
  getTopBatsmen,
  getTopBowlers,
  getSeasonTrend,
} from '@/services/api';

import type {
  TopBatsman,
  TopBowler,
  SeasonRunsTrend,
} from '@/types';

import {
  Card,
  LoadingState,
  ErrorState,
} from '@/components/ui';

import Sparkline from '@/components/Sparkline';
import Leaderboard from '@/components/Leaderboard';

type Summary = Awaited<ReturnType<typeof getDashboardSummary>>;

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [batsmen, setBatsmen] = useState<TopBatsman[]>([]);
  const [bowlers, setBowlers] = useState<TopBowler[]>([]);
  const [trend, setTrend] = useState<SeasonRunsTrend[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  const load = () => {
    setStatus('loading');

    Promise.all([
      getDashboardSummary(),
      getTopBatsmen(),
      getTopBowlers(),
      getSeasonTrend(),
    ])
      .then(([s, b, bo, t]) => {
        setSummary(s);
        setBatsmen(b.slice(0, 6));
        setBowlers(bo.slice(0, 6));
        setTrend(t);
        setStatus('ready');
      })
      .catch((err) => {
  console.error('Dashboard load failed:', err);
  setStatus('error');
});
  };

  useEffect(load, []);

  if (status === 'loading') {
    return <LoadingState label="Loading dashboard" />;
  }

  if (status === 'error' || !summary) {
    return <ErrorState onRetry={load} />;
  }

  return (
    <div className="min-h-screen bg-navy-950">

      {/* =========================================================
          HERO SECTION
          ========================================================= */}

      <div className="relative overflow-hidden stadium-glow border-b border-navy-700">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-electric-500/10 blur-3xl" />
          <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative px-8 pt-12 pb-10">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />

            <div className="text-[11px] font-mono tracking-[0.2em] text-electric-400">
              IPL DATA AT A GLANCE
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-ink-100 tracking-tight max-w-3xl mb-4">
            Explore IPL history, player performance and team insights
          </h1>

          <p className="text-ink-500 text-sm max-w-2xl mb-10">
            A complete view of Indian Premier League statistics across
            seasons, teams, players, batting performances and bowling
            performances.
          </p>

          {/* =====================================================
              STATISTICS CARDS
              ===================================================== */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

            {[
              {
                label: 'Matches',
                value: summary.totalMatches,
                color: '#2F7BFF',
              },
              {
                label: 'Teams',
                value: summary.totalTeams,
                color: '#52DDA6',
              },
              {
                label: 'Players',
                value: summary.totalPlayers,
                color: '#6FA8FF',
              },
              {
                label: 'Seasons',
                value: summary.totalSeasons,
                color: '#FF8B5E',
              },
              {
                label: 'Total Runs',
                value: summary.totalRuns.toLocaleString(),
                color: '#2ECC8F',
              },
              {
                label: 'Wickets',
                value: summary.totalWickets.toLocaleString(),
                color: '#FF6B35',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-xl p-4 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]"
              >

                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: s.color }}
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${s.color}22, transparent 70%)`,
                  }}
                />

                <div className="relative text-[10px] font-mono tracking-wide text-ink-500 uppercase mb-2">
                  {s.label}
                </div>

                <div className="relative font-display text-2xl text-ink-100 mb-2">
                  {s.value}
                </div>

                <div className="relative opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkline
                    data={Array.from(
                      { length: 10 },
                      (_, i) => 20 + i * 4 + Math.random() * 25
                    )}
                    color={s.color}
                  />
                </div>

              </div>
            ))}

          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN DASHBOARD CONTENT
          ========================================================= */}

      <div className="p-8 space-y-8">

        {/* =======================================================
            TOP PERFORMERS / BOWLING LEADERS (LEADERBOARD)
            ======================================================= */}

        <div className="grid lg:grid-cols-2 gap-5">

          <Card className="p-6">

            <div className="flex items-baseline justify-between mb-5">

              <div>
                <div className="text-[10px] font-mono tracking-[0.15em] text-electric-400 uppercase mb-1">
                  Batting Analysis
                </div>

                <h3 className="font-display text-lg text-ink-100">
                  Top Run Scorers
                </h3>
              </div>

              <span className="text-[11px] font-mono text-ink-500">
                CAREER RUNS
              </span>

            </div>

            <Leaderboard
              accent="#1653C7"
              accentSoft="#6FA8FF"
              entries={batsmen.slice(0, 6).map((b) => ({
                name: b.player,
                subtitle: b.team,
                value: b.runs,
                displayValue: b.runs.toLocaleString(),
              }))}
            />

          </Card>


          <Card className="p-6">

            <div className="flex items-baseline justify-between mb-5">

              <div>
                <div className="text-[10px] font-mono tracking-[0.15em] text-stump-500 uppercase mb-1">
                  Bowling Analysis
                </div>

                <h3 className="font-display text-lg text-ink-100">
                  Top Wicket Takers
                </h3>
              </div>

              <span className="text-[11px] font-mono text-ink-500">
                CAREER WICKETS
              </span>

            </div>

            <Leaderboard
              accent="#E5501D"
              accentSoft="#FF8B5E"
              entries={bowlers.slice(0, 6).map((b) => ({
                name: b.player,
                subtitle: b.team,
                value: b.wickets,
                displayValue: String(b.wickets),
              }))}
            />

          </Card>

        </div>


        {/* =======================================================
            SEASON TREND — GLOWING GRADIENT AREA CHART
            ======================================================= */}

        <Card className="p-6">

          <div className="flex items-baseline justify-between mb-5">

            <div>
              <div className="text-[10px] font-mono tracking-[0.15em] text-emerald-400 uppercase mb-1">
                Historical Trend
              </div>

              <h3 className="font-display text-lg text-ink-100">
                Season-wise Run Totals
              </h3>
            </div>

            <span className="text-[11px] font-mono text-ink-500">
              RUNS PER SEASON
            </span>

          </div>

          <ResponsiveContainer width="100%" height={260}>

            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

              <defs>
                <linearGradient id="trendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#52DDA6" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#2F7BFF" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2F7BFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#52DDA6" />
                  <stop offset="100%" stopColor="#2F7BFF" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E2B4A"
                vertical={false}
              />

              <XAxis
                dataKey="season"
                tick={{ fill: '#8891A8', fontSize: 11 }}
                axisLine={{ stroke: '#1E2B4A' }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: '#8891A8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: '#101830',
                  border: '1px solid #1E2B4A',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 0 20px -6px rgba(47,123,255,0.4)',
                }}
                labelStyle={{ color: '#F5F7FA' }}
                cursor={{ stroke: '#2F7BFF', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              <Area
                type="monotone"
                dataKey="totalRuns"
                stroke="url(#trendLine)"
                strokeWidth={3}
                fill="url(#trendGlow)"
                dot={{ fill: '#52DDA6', stroke: '#0B1120', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, fill: '#6FA8FF', stroke: '#0B1120', strokeWidth: 2 }}
                animationDuration={1100}
                animationEasing="ease-out"
              />

            </AreaChart>

          </ResponsiveContainer>

        </Card>

      </div>
    </div>
  );
}
