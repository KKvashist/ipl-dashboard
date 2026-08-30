import type { Team, Player, Match, Season, TopBatsman, TopBowler, SeasonRunsTrend } from '@/types';

export const teams: Team[] = [
  { id: 't1', name: 'Mumbai Indians', shortName: 'MI', color: '#2F7BFF', matchesPlayed: 261, wins: 144, losses: 111, titles: 5 },
  { id: 't2', name: 'Chennai Super Kings', shortName: 'CSK', color: '#FFCB05', matchesPlayed: 254, wins: 147, losses: 100, titles: 5 },
  { id: 't3', name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#E5501D', matchesPlayed: 258, wins: 122, losses: 128, titles: 1 },
  { id: 't4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#6FA8FF', matchesPlayed: 254, wins: 128, losses: 118, titles: 3 },
  { id: 't5', name: 'Delhi Capitals', shortName: 'DC', color: '#2ECC8F', matchesPlayed: 250, wins: 111, losses: 130, titles: 0 },
  { id: 't6', name: 'Punjab Kings', shortName: 'PBKS', color: '#FF6B35', matchesPlayed: 250, wins: 108, losses: 133, titles: 0 },
  { id: 't7', name: 'Rajasthan Royals', shortName: 'RR', color: '#FF8B5E', matchesPlayed: 244, wins: 117, losses: 119, titles: 1 },
  { id: 't8', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#FF6B35', matchesPlayed: 197, wins: 96, losses: 97, titles: 1 },
  { id: 't9', name: 'Gujarat Titans', shortName: 'GT', color: '#52DDA6', matchesPlayed: 58, wins: 37, losses: 20, titles: 1 },
  { id: 't10', name: 'Lucknow Super Giants', shortName: 'LSG', color: '#1653C7', matchesPlayed: 58, wins: 31, losses: 26, titles: 0 },
];

export const players: Player[] = [
  { id: 'p1', name: 'Virat Kohli', team: 'RCB', role: 'Batter', matches: 252, runs: 8004, battingAverage: 38.30, strikeRate: 131.97, wickets: 4, economy: 8.79, highestScore: 122, bestBowling: '1/13' },
  { id: 'p2', name: 'Rohit Sharma', team: 'MI', role: 'Batter', matches: 261, runs: 6628, battingAverage: 29.62, strikeRate: 130.15, wickets: 15, economy: 8.12, highestScore: 109, bestBowling: '2/17' },
  { id: 'p3', name: 'MS Dhoni', team: 'CSK', role: 'Wicketkeeper', matches: 264, runs: 5243, battingAverage: 39.13, strikeRate: 137.02, wickets: 0, economy: null, highestScore: 84, bestBowling: null },
  { id: 'p4', name: 'Suryakumar Yadav', team: 'MI', role: 'Batter', matches: 172, runs: 3494, battingAverage: 31.20, strikeRate: 142.94, wickets: 0, economy: null, highestScore: 103, bestBowling: null },
  { id: 'p5', name: 'Shubman Gill', team: 'GT', role: 'Batter', matches: 133, runs: 4530, battingAverage: 39.04, strikeRate: 133.62, wickets: 0, economy: null, highestScore: 129, bestBowling: null },
  { id: 'p6', name: 'KL Rahul', team: 'LSG', role: 'Wicketkeeper', matches: 132, runs: 4683, battingAverage: 45.87, strikeRate: 133.99, wickets: 0, economy: null, highestScore: 132, bestBowling: null },
  { id: 'p7', name: 'Hardik Pandya', team: 'MI', role: 'All-rounder', matches: 148, runs: 2632, battingAverage: 27.14, strikeRate: 145.31, wickets: 92, economy: 8.98, highestScore: 91, bestBowling: '5/25' },
  { id: 'p8', name: 'Ravindra Jadeja', team: 'CSK', role: 'All-rounder', matches: 240, runs: 2756, battingAverage: 26.24, strikeRate: 129.99, wickets: 152, economy: 7.62, highestScore: 62, bestBowling: '5/16' },
  { id: 'p9', name: 'Jasprit Bumrah', team: 'MI', role: 'Bowler', matches: 133, runs: 56, battingAverage: 5.09, strikeRate: 84.85, wickets: 165, economy: 7.32, highestScore: 10, bestBowling: '5/10' },
  { id: 'p10', name: 'Rashid Khan', team: 'GT', role: 'Bowler', matches: 122, runs: 640, battingAverage: 15.24, strikeRate: 150.35, wickets: 151, economy: 6.65, highestScore: 34, bestBowling: '4/24' },
  { id: 'p11', name: 'Yuzvendra Chahal', team: 'RR', role: 'Bowler', matches: 160, runs: 60, battingAverage: 6.00, strikeRate: 90.90, wickets: 205, economy: 7.83, highestScore: 18, bestBowling: '5/40' },
  { id: 'p12', name: 'David Warner', team: 'DC', role: 'Batter', matches: 176, runs: 6565, battingAverage: 41.03, strikeRate: 139.96, wickets: 0, economy: null, highestScore: 126, bestBowling: null },
  { id: 'p13', name: 'AB de Villiers', team: 'RCB', role: 'Wicketkeeper', matches: 184, runs: 5162, battingAverage: 39.71, strikeRate: 151.68, wickets: 0, economy: null, highestScore: 133, bestBowling: null },
  { id: 'p14', name: 'Sunil Narine', team: 'KKR', role: 'All-rounder', matches: 187, runs: 2050, battingAverage: 15.51, strikeRate: 165.86, wickets: 187, economy: 6.75, highestScore: 109, bestBowling: '5/19' },
  { id: 'p15', name: 'Andre Russell', team: 'KKR', role: 'All-rounder', matches: 140, runs: 2617, battingAverage: 29.40, strikeRate: 179.98, wickets: 117, economy: 9.36, highestScore: 88, bestBowling: '4/29' },
  { id: 'p16', name: 'Shreyas Iyer', team: 'PBKS', role: 'Batter', matches: 133, runs: 3733, battingAverage: 33.03, strikeRate: 127.11, wickets: 0, economy: null, highestScore: 96, bestBowling: null },
  { id: 'p17', name: 'Mohammed Shami', team: 'GT', role: 'Bowler', matches: 122, runs: 32, battingAverage: 4.57, strikeRate: 76.19, wickets: 137, economy: 8.19, highestScore: 9, bestBowling: '4/11' },
  { id: 'p18', name: 'Faf du Plessis', team: 'RCB', role: 'Batter', matches: 141, runs: 4571, battingAverage: 35.16, strikeRate: 129.83, wickets: 0, economy: null, highestScore: 96, bestBowling: null },
  { id: 'p19', name: 'Trent Boult', team: 'RR', role: 'Bowler', matches: 99, runs: 55, battingAverage: 6.11, strikeRate: 94.83, wickets: 108, economy: 8.24, highestScore: 12, bestBowling: '4/18' },
  { id: 'p20', name: 'Kagiso Rabada', team: 'PBKS', role: 'Bowler', matches: 88, runs: 61, battingAverage: 6.78, strikeRate: 103.39, wickets: 106, economy: 8.44, highestScore: 13, bestBowling: '4/21' },
];

export const seasons: Season[] = [
  { id: 's2025', year: 2025, champion: 'Royal Challengers Bengaluru', runnerUp: 'Punjab Kings', matches: 74 },
  { id: 's2024', year: 2024, champion: 'Kolkata Knight Riders', runnerUp: 'Sunrisers Hyderabad', matches: 74 },
  { id: 's2023', year: 2023, champion: 'Chennai Super Kings', runnerUp: 'Gujarat Titans', matches: 74 },
  { id: 's2022', year: 2022, champion: 'Gujarat Titans', runnerUp: 'Rajasthan Royals', matches: 74 },
  { id: 's2021', year: 2021, champion: 'Chennai Super Kings', runnerUp: 'Kolkata Knight Riders', matches: 60 },
  { id: 's2020', year: 2020, champion: 'Mumbai Indians', runnerUp: 'Delhi Capitals', matches: 60 },
  { id: 's2019', year: 2019, champion: 'Mumbai Indians', runnerUp: 'Chennai Super Kings', matches: 60 },
  { id: 's2018', year: 2018, champion: 'Chennai Super Kings', runnerUp: 'Sunrisers Hyderabad', matches: 60 },
  { id: 's2017', year: 2017, champion: 'Mumbai Indians', runnerUp: 'Rising Pune Supergiant', matches: 59 },
  { id: 's2016', year: 2016, champion: 'Sunrisers Hyderabad', runnerUp: 'Royal Challengers Bengaluru', matches: 60 },
  { id: 's2015', year: 2015, champion: 'Mumbai Indians', runnerUp: 'Chennai Super Kings', matches: 59 },
  { id: 's2014', year: 2014, champion: 'Kolkata Knight Riders', runnerUp: 'Punjab Kings', matches: 60 },
  { id: 's2013', year: 2013, champion: 'Mumbai Indians', runnerUp: 'Chennai Super Kings', matches: 76 },
  { id: 's2012', year: 2012, champion: 'Kolkata Knight Riders', runnerUp: 'Chennai Super Kings', matches: 76 },
  { id: 's2011', year: 2011, champion: 'Chennai Super Kings', runnerUp: 'Royal Challengers Bengaluru', matches: 73 },
  { id: 's2010', year: 2010, champion: 'Chennai Super Kings', runnerUp: 'Mumbai Indians', matches: 60 },
  { id: 's2009', year: 2009, champion: 'Deccan Chargers', runnerUp: 'Royal Challengers Bengaluru', matches: 59 },
  { id: 's2008', year: 2008, champion: 'Rajasthan Royals', runnerUp: 'Chennai Super Kings', matches: 59 },
];

const venues = [
  { name: 'Wankhede Stadium', city: 'Mumbai' },
  { name: 'M. A. Chidambaram Stadium', city: 'Chennai' },
  { name: 'M. Chinnaswamy Stadium', city: 'Bengaluru' },
  { name: 'Eden Gardens', city: 'Kolkata' },
  { name: 'Arun Jaitley Stadium', city: 'Delhi' },
  { name: 'Narendra Modi Stadium', city: 'Ahmedabad' },
  { name: 'Rajiv Gandhi International Stadium', city: 'Hyderabad' },
  { name: 'Sawai Mansingh Stadium', city: 'Jaipur' },
  { name: 'Punjab Cricket Association Stadium', city: 'Mohali' },
  { name: 'BRSABV Ekana Cricket Stadium', city: 'Lucknow' },
];

function generateMatches(): Match[] {
  const result: Match[] = [];
  let idCounter = 1;

  seasons.slice(0, 10).forEach((season) => {
    const teamNames = teams.map((t) => t.shortName);
    for (let i = 0; i < 14; i++) {
      const teamA = teamNames[Math.floor(Math.random() * teamNames.length)];
      let teamB = teamNames[Math.floor(Math.random() * teamNames.length)];
      while (teamB === teamA) {
        teamB = teamNames[Math.floor(Math.random() * teamNames.length)];
      }
      const venue = venues[Math.floor(Math.random() * venues.length)];
      const tossWinner = Math.random() > 0.5 ? teamA : teamB;
      const winner = Math.random() > 0.08 ? (Math.random() > 0.5 ? teamA : teamB) : null;
      const margin = winner
        ? Math.random() > 0.5
          ? `${5 + Math.floor(Math.random() * 60)} runs`
          : `${2 + Math.floor(Math.random() * 8)} wickets`
        : null;

      result.push({
        id: `m${idCounter++}`,
        season: season.year,
        date: `${season.year}-04-${String(1 + (i % 28)).padStart(2, '0')}`,
        teamA,
        teamB,
        venue: venue.name,
        city: venue.city,
        tossWinner,
        tossDecision: Math.random() > 0.5 ? 'bat' : 'field',
        winner,
        winMargin: margin,
        playerOfMatch: winner ? players[Math.floor(Math.random() * players.length)].name : null,
        status: winner ? 'completed' : 'no result',
      });
    }
  });

  return result;
}

export const matches: Match[] = generateMatches();

export const topBatsmen: TopBatsman[] = [...players]
  .sort((a, b) => b.runs - a.runs)
  .slice(0, 10)
  .map((p) => ({
    player: p.name,
    team: p.team,
    runs: p.runs,
    average: p.battingAverage ?? 0,
    strikeRate: p.strikeRate ?? 0,
  }));

export const topBowlers: TopBowler[] = [...players]
  .sort((a, b) => b.wickets - a.wickets)
  .slice(0, 10)
  .map((p) => ({
    player: p.name,
    team: p.team,
    wickets: p.wickets,
    economy: p.economy ?? 0,
  }));

export const seasonTrend: SeasonRunsTrend[] = seasons
  .slice(0, 12)
  .reverse()
  .map((s, i) => ({
    season: s.year,
    totalRuns: 2100 + i * 90 + Math.floor(Math.random() * 200),
    totalWickets: 140 + i * 6 + Math.floor(Math.random() * 20),
    matches: s.matches,
  }));

export const dashboardSummary = {
  totalMatches: matches.length,
  totalTeams: teams.length,
  totalPlayers: players.length,
  totalSeasons: seasons.length,
  totalRuns: players.reduce((sum, p) => sum + p.runs, 0) * 4,
  totalWickets: players.reduce((sum, p) => sum + p.wickets, 0) * 4,
};