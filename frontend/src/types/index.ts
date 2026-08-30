// These types mirror the shape the real backend API will return once the
// dataset is ingested. Mock data in src/data/mock.ts conforms to these
// exact shapes so swapping the data layer later requires no type changes.

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // hex, used for chart/badge accents
  matchesPlayed: number;
  wins: number;
  losses: number;
  titles: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
}

export interface Season {
  id: string;
  year: number;
  champion: string;
  runnerUp: string;
  matches: number;
}

export interface Match {
  id: string;
  season: number;
  date: string; // ISO date
  teamA: string;
  teamB: string;
  venue: string;
  city: string;
  tossWinner: string;
  tossDecision: 'bat' | 'field';
  winner: string | null;
  winMargin: string | null;
  playerOfMatch: string | null;
  status: 'completed' | 'no result' | 'abandoned';
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  matches: number;
  runs: number;
  battingAverage: number | null;
  strikeRate: number | null;
  wickets: number;
  economy: number | null;
  highestScore: number;
  bestBowling: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface DashboardSummary {
  totalMatches: number;
  totalTeams: number;
  totalPlayers: number;
  totalSeasons: number;
  totalRuns: number;
  totalWickets: number;
  sampleNote?: string;
}

export interface TopBatsman {
  player: string;
  team: string;
  runs: number;
  average: number;
  strikeRate: number;
}

export interface TopBowler {
  player: string;
  team: string;
  wickets: number;
  economy: number;
}

export interface SeasonRunsTrend {
  season: number;
  totalRuns: number;
  totalWickets: number;
  matches: number;
}