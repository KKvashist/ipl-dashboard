// src/services/api.ts
import type {
  DashboardSummary,
  TopBatsman,
  TopBowler,
  SeasonRunsTrend,
  Match,
  Season,
  Player,
  Team,
  PaginatedResponse,
} from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ---- Shared fetch helper ----

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ---- Raw backend shape (Prisma) ----

interface RawMatch {
  id: number;
  season: string;
  city: string | null;
  date: string;
  matchType: string;
  playerOfMatch: string | null;
  venue: string;
  team1: string;
  team2: string;
  tossWinner: string;
  tossDecision: string;
  winner: string | null;
  result: string | null;
  resultMargin: number | null;
}

interface RawPaginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function mapMatch(raw: RawMatch): Match {
  return {
    id: String(raw.id),
    season: parseInt(raw.season, 10),
    date: raw.date,
    teamA: raw.team1,
    teamB: raw.team2,
    venue: raw.venue,
    city: raw.city ?? '',
    tossWinner: raw.tossWinner,
    tossDecision: raw.tossDecision as 'bat' | 'field',
    winner: raw.winner,
    winMargin:
      raw.winner && raw.resultMargin != null
        ? `${raw.resultMargin} ${raw.result ?? ''}`.trim()
        : null,
    playerOfMatch: raw.playerOfMatch,
    status: raw.winner ? 'completed' : 'no result',
  };
}

// ---- Public API functions used by components ----

export const getDashboardSummary = () =>
  fetchJson<DashboardSummary>('/api/dashboard/summary');

// FIXED: backend wraps leaderboard results as { data: [...] }.
// Previously this returned that wrapper object directly, so Dashboard.tsx's
// `.slice(0, 6)` call on the "array" threw "b.slice is not a function"
// because it was actually calling .slice on a plain object.
export const getTopBatsmen = async (): Promise<TopBatsman[]> => {
  const res = await fetchJson<{ data: TopBatsman[] }>('/api/players/top-batsmen');
  return res.data;
};

export const getTopBowlers = async (): Promise<TopBowler[]> => {
  const res = await fetchJson<{ data: TopBowler[] }>('/api/players/top-bowlers');
  return res.data;
};

// FIXED: same wrapping issue as top-batsmen/top-bowlers above — the backend
// returns { data: [...] }, not a bare array. Analytics.tsx passes this
// straight into <LineChart data={trend}>, which needs a real array or it
// throws "trend.map is not a function" at render time.
export const getSeasonTrend = async (): Promise<SeasonRunsTrend[]> => {
  const res = await fetchJson<{ data: SeasonRunsTrend[] }>('/api/season-trend');
  return res.data;
};

export interface GetMatchesParams {
  page?: number;
  limit?: number;
  search?: string;
  season?: number;
}

export const getMatches = async (
  params: GetMatchesParams = {}
): Promise<PaginatedResponse<Match>> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.season) query.set('season', String(params.season));

  const qs = query.toString();
  const raw = await fetchJson<RawPaginated<RawMatch>>(
    `/api/matches${qs ? `?${qs}` : ''}`
  );

  return {
    data: raw.data.map(mapMatch),
    pagination: {
      page: raw.pagination.page,
      limit: raw.pagination.limit,
      total: raw.pagination.total,
    },
  };
};

export const getSeasons = () => fetchJson<Season[]>('/api/seasons');

export const getTeams = () => fetchJson<Team[]>('/api/teams');

export interface GetPlayersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  team?: string;
  sortBy?: 'runs' | 'wickets' | 'battingAverage' | 'strikeRate';
}

export const getPlayers = (params: GetPlayersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.team) query.set('team', params.team);
  if (params.sortBy) query.set('sortBy', params.sortBy);

  const qs = query.toString();
  return fetchJson<PaginatedResponse<Player>>(
    `/api/players${qs ? `?${qs}` : ''}`
  );
};