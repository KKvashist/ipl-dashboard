// backend/src/routes/players.ts
//
// IMPORTANT DATA LIMITATION: your schema has no field indicating who kept
// wicket (Delivery.fielder on a catch isn't reliably the keeper). Role is
// classified as Batter / Bowler / All-rounder from ball/run thresholds only.
// "Wicketkeeper" is NOT derived here — hardcoding a list of known keepers
// would be guessing rather than reading it from your data, so it's left out.
// If your assignment specifically requires a Wicketkeeper role, the honest
// fix is adding a `role` or `isKeeper` column to a Player reference table,
// not inferring it from deliveries.
//
// "team" below is a player's PRIMARY franchise (the team they appear for
// most often across all deliveries, batting + bowling combined), canonicalized
// through the same rebrand map used by /api/teams and /api/seasons so e.g.
// "Kings XI Punjab" seasons roll up into "Punjab Kings".
//
// "matches" for a player is approximated as the larger of matches-batted and
// matches-bowled (most players either overlap fully as all-rounders or only
// do one discipline; this slightly undercounts pure specialists who, in a
// handful of matches, did neither — negligible at this data volume).

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { canonicalTeamName } from "../utils/teamNames";

const router = Router();
const prisma = new PrismaClient();

type Role = "Batter" | "Bowler" | "All-rounder";

function classifyRole(ballsFaced: number, legalBalls: number): Role {
  const bats = ballsFaced >= 30; // roughly 5+ meaningful innings of any length
  const bowls = legalBalls >= 30; // roughly 5+ overs career
  if (bats && bowls) return "All-rounder";
  if (bowls) return "Bowler";
  return "Batter";
}

function shortNameFor(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("");
}

interface RawPlayerRow {
  player: string;
  matchesBatted: bigint | null;
  inningsBatted: bigint | null;
  runs: bigint | null;
  ballsFaced: bigint | null;
  dismissals: bigint | null;
  highestScore: number | null;
  matchesBowled: bigint | null;
  legalBalls: bigint | null;
  runsConceded: bigint | null;
  wickets: bigint | null;
  bestWkts: number | null;
  bestRuns: number | null;
  team: string | null;
}

/**
 * @swagger
 * /api/players:
 *   get:
 *     tags: [Players]
 *     summary: List players with combined career batting + bowling stats
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [Batter, Bowler, All-rounder] }
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *         description: Team short name, e.g. "MI", "CSK"
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [runs, wickets, battingAverage, strikeRate] }
 *     responses:
 *       200:
 *         description: Paginated player list with career stats
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = ((req.query.search as string) || "").trim();
    const roleFilter = (req.query.role as string) || "";
    const teamFilter = (req.query.team as string) || ""; // expects team shortName, e.g. "MI"
    const sortBy = (req.query.sortBy as string) || "runs";

    const rows = await prisma.$queryRaw<RawPlayerRow[]>`
      WITH batting AS (
        SELECT
          batter AS player,
          COUNT(DISTINCT "matchId") AS matches_batted,
          COUNT(DISTINCT ("matchId", inning)) AS innings_batted,
          SUM("batsmanRuns")::bigint AS runs,
          SUM(CASE WHEN "extrasType" IS DISTINCT FROM 'wides' THEN 1 ELSE 0 END)::bigint AS balls_faced,
          SUM(CASE WHEN "isWicket" = true AND "playerDismissed" = batter THEN 1 ELSE 0 END)::bigint AS dismissals
        FROM "Delivery"
        WHERE batter IS NOT NULL
        GROUP BY batter
      ),
      batting_innings AS (
        SELECT batter, "matchId", inning, SUM("batsmanRuns") AS inns_runs
        FROM "Delivery"
        WHERE batter IS NOT NULL
        GROUP BY batter, "matchId", inning
      ),
      batting_highest AS (
        SELECT batter AS player, MAX(inns_runs) AS highest_score
        FROM batting_innings
        GROUP BY batter
      ),
      bowling_ball AS (
        SELECT
          bowler,
          "matchId",
          inning,
          CASE WHEN "extrasType" IS DISTINCT FROM 'wides' AND "extrasType" IS DISTINCT FROM 'noballs'
               THEN 1 ELSE 0 END AS is_legal,
          CASE WHEN "extrasType" IN ('byes', 'legbyes')
               THEN "totalRuns" - "extraRuns" ELSE "totalRuns" END AS runs_charged,
          CASE WHEN "isWicket" = true AND "dismissalKind" IS DISTINCT FROM 'run out'
               THEN 1 ELSE 0 END AS is_wkt
        FROM "Delivery"
        WHERE bowler IS NOT NULL
      ),
      bowling AS (
        SELECT
          bowler AS player,
          COUNT(DISTINCT "matchId") AS matches_bowled,
          SUM(is_legal)::bigint AS legal_balls,
          SUM(runs_charged)::bigint AS runs_conceded,
          SUM(is_wkt)::bigint AS wickets
        FROM bowling_ball
        GROUP BY bowler
      ),
      bowling_innings AS (
        SELECT bowler, "matchId", inning, SUM(is_wkt) AS wkts_in_inns, SUM(runs_charged) AS runs_in_inns
        FROM bowling_ball
        GROUP BY bowler, "matchId", inning
      ),
      best_bowling AS (
        SELECT DISTINCT ON (bowler) bowler AS player, wkts_in_inns AS best_wkts, runs_in_inns AS best_runs
        FROM bowling_innings
        ORDER BY bowler, wkts_in_inns DESC, runs_in_inns ASC
      ),
      team_appearances AS (
        SELECT batter AS player, "battingTeam" AS team, COUNT(*) AS cnt
        FROM "Delivery" WHERE batter IS NOT NULL GROUP BY batter, "battingTeam"
        UNION ALL
        SELECT bowler AS player, "bowlingTeam" AS team, COUNT(*) AS cnt
        FROM "Delivery" WHERE bowler IS NOT NULL GROUP BY bowler, "bowlingTeam"
      ),
      team_totals AS (
        SELECT player, team, SUM(cnt) AS total_cnt
        FROM team_appearances
        GROUP BY player, team
      ),
      primary_team AS (
        SELECT DISTINCT ON (player) player, team
        FROM team_totals
        ORDER BY player, total_cnt DESC
      )
      SELECT
        COALESCE(b.player, bw.player) AS player,
        b.matches_batted AS "matchesBatted",
        b.innings_batted AS "inningsBatted",
        b.runs AS runs,
        b.balls_faced AS "ballsFaced",
        b.dismissals AS dismissals,
        bh.highest_score AS "highestScore",
        bw.matches_bowled AS "matchesBowled",
        bw.legal_balls AS "legalBalls",
        bw.runs_conceded AS "runsConceded",
        bw.wickets AS wickets,
        bb.best_wkts AS "bestWkts",
        bb.best_runs AS "bestRuns",
        pt.team AS team
      FROM batting b
      FULL OUTER JOIN bowling bw ON bw.player = b.player
      LEFT JOIN batting_highest bh ON bh.player = COALESCE(b.player, bw.player)
      LEFT JOIN best_bowling bb ON bb.player = COALESCE(b.player, bw.player)
      LEFT JOIN primary_team pt ON pt.player = COALESCE(b.player, bw.player)
    `;

    let players = rows.map((r) => {
      const runs = Number(r.runs ?? 0);
      const ballsFaced = Number(r.ballsFaced ?? 0);
      const dismissals = Number(r.dismissals ?? 0);
      const legalBalls = Number(r.legalBalls ?? 0);
      const runsConceded = Number(r.runsConceded ?? 0);
      const wickets = Number(r.wickets ?? 0);
      const matches = Math.max(Number(r.matchesBatted ?? 0), Number(r.matchesBowled ?? 0));

      const battingAverage = dismissals > 0 ? Math.round((runs / dismissals) * 100) / 100 : null;
      const strikeRate = ballsFaced > 0 ? Math.round((runs / ballsFaced) * 100 * 100) / 100 : null;
      const economy = legalBalls > 0 ? Math.round((runsConceded / (legalBalls / 6)) * 100) / 100 : null;
      const bestBowling = r.bestWkts !== null ? `${r.bestWkts}/${r.bestRuns}` : null;
      const team = r.team ? canonicalTeamName(r.team) : "Unknown";

      return {
        id: r.player.toLowerCase().replace(/\s+/g, "-"),
        name: r.player,
        team,
        teamShort: shortNameFor(team),
        role: classifyRole(ballsFaced, legalBalls),
        matches,
        runs,
        battingAverage,
        strikeRate,
        wickets,
        economy,
        highestScore: Number(r.highestScore ?? 0),
        bestBowling,
      };
    });

    if (search) {
      const s = search.toLowerCase();
      players = players.filter((p) => p.name.toLowerCase().includes(s));
    }
    if (roleFilter) {
      players = players.filter((p) => p.role === roleFilter);
    }
    if (teamFilter) {
      players = players.filter((p) => p.teamShort === teamFilter);
    }

    const sortKeyMap: Record<string, (p: (typeof players)[number]) => number> = {
      runs: (p) => p.runs,
      wickets: (p) => p.wickets,
      battingAverage: (p) => p.battingAverage ?? -1,
      strikeRate: (p) => p.strikeRate ?? -1,
    };
    const sortFn = sortKeyMap[sortBy] || sortKeyMap.runs;
    players.sort((a, b) => sortFn(b) - sortFn(a));

    const total = players.length;
    const offset = (page - 1) * limit;
    const paged = players.slice(offset, offset + limit).map(({ teamShort, ...rest }) => rest);

    res.json({
      data: paged,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

/**
 * @swagger
 * /api/players/top-batsmen:
 *   get:
 *     tags: [Players]
 *     summary: Leaderboard of top run scorers
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: minInnings
 *         schema: { type: integer, default: 0 }
 *         description: Minimum career innings to qualify (filters out small-sample outliers)
 *     responses:
 *       200:
 *         description: List of top batsmen by career runs
 */
router.get("/top-batsmen", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const minInnings = Math.max(0, parseInt(req.query.minInnings as string) || 0);

    const rows = await prisma.$queryRaw<
      { player: string; runs: bigint; ballsFaced: bigint; dismissals: bigint; innings: bigint; team: string | null }[]
    >`
      WITH batting AS (
        SELECT
          batter AS player,
          COUNT(DISTINCT ("matchId", inning)) AS innings,
          SUM("batsmanRuns")::bigint AS runs,
          SUM(CASE WHEN "extrasType" IS DISTINCT FROM 'wides' THEN 1 ELSE 0 END)::bigint AS "ballsFaced",
          SUM(CASE WHEN "isWicket" = true AND "playerDismissed" = batter THEN 1 ELSE 0 END)::bigint AS dismissals
        FROM "Delivery"
        WHERE batter IS NOT NULL
        GROUP BY batter
      ),
      team_totals AS (
        SELECT batter AS player, "battingTeam" AS team, COUNT(*) AS cnt
        FROM "Delivery" WHERE batter IS NOT NULL GROUP BY batter, "battingTeam"
      ),
      primary_team AS (
        SELECT DISTINCT ON (player) player, team FROM team_totals ORDER BY player, cnt DESC
      )
      SELECT b.player, b.runs, b."ballsFaced", b.dismissals, b.innings, pt.team
      FROM batting b
      LEFT JOIN primary_team pt ON pt.player = b.player
      WHERE b.innings >= ${minInnings}
      ORDER BY b.runs DESC
      LIMIT ${limit}
    `;

    const data = rows.map((r) => {
      const runs = Number(r.runs);
      const ballsFaced = Number(r.ballsFaced);
      const dismissals = Number(r.dismissals);
      return {
        player: r.player,
        team: r.team ? canonicalTeamName(r.team) : "Unknown",
        runs,
        average: dismissals > 0 ? Math.round((runs / dismissals) * 100) / 100 : runs,
        strikeRate: ballsFaced > 0 ? Math.round((runs / ballsFaced) * 100 * 100) / 100 : 0,
      };
    });

    res.json({ data });
  } catch (error) {
    console.error("Error fetching top batsmen:", error);
    res.status(500).json({ error: "Failed to fetch batting stats" });
  }
});

/**
 * @swagger
 * /api/players/top-bowlers:
 *   get:
 *     tags: [Players]
 *     summary: Leaderboard of top wicket takers
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: minOvers
 *         schema: { type: number, default: 0 }
 *         description: Minimum career overs bowled to qualify
 *     responses:
 *       200:
 *         description: List of top bowlers by career wickets
 */
router.get("/top-bowlers", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const minOvers = Math.max(0, parseFloat(req.query.minOvers as string) || 0);
    const minLegalBalls = Math.round(minOvers * 6);

    const rows = await prisma.$queryRaw<
      { player: string; wickets: bigint; legalBalls: bigint; runsConceded: bigint; team: string | null }[]
    >`
      WITH bowling_ball AS (
        SELECT
          bowler,
          CASE WHEN "extrasType" IS DISTINCT FROM 'wides' AND "extrasType" IS DISTINCT FROM 'noballs'
               THEN 1 ELSE 0 END AS is_legal,
          CASE WHEN "extrasType" IN ('byes', 'legbyes')
               THEN "totalRuns" - "extraRuns" ELSE "totalRuns" END AS runs_charged,
          CASE WHEN "isWicket" = true AND "dismissalKind" IS DISTINCT FROM 'run out'
               THEN 1 ELSE 0 END AS is_wkt,
          "bowlingTeam"
        FROM "Delivery"
        WHERE bowler IS NOT NULL
      ),
      bowling AS (
        SELECT bowler AS player,
          SUM(is_legal)::bigint AS "legalBalls",
          SUM(runs_charged)::bigint AS "runsConceded",
          SUM(is_wkt)::bigint AS wickets
        FROM bowling_ball
        GROUP BY bowler
      ),
      team_totals AS (
        SELECT bowler AS player, "bowlingTeam" AS team, COUNT(*) AS cnt
        FROM bowling_ball GROUP BY bowler, "bowlingTeam"
      ),
      primary_team AS (
        SELECT DISTINCT ON (player) player, team FROM team_totals ORDER BY player, cnt DESC
      )
      SELECT bw.player, bw.wickets, bw."legalBalls", bw."runsConceded", pt.team
      FROM bowling bw
      LEFT JOIN primary_team pt ON pt.player = bw.player
      WHERE bw."legalBalls" >= ${minLegalBalls}
      ORDER BY bw.wickets DESC
      LIMIT ${limit}
    `;

    const data = rows.map((r) => {
      const legalBalls = Number(r.legalBalls);
      const runsConceded = Number(r.runsConceded);
      return {
        player: r.player,
        team: r.team ? canonicalTeamName(r.team) : "Unknown",
        wickets: Number(r.wickets),
        economy: legalBalls > 0 ? Math.round((runsConceded / (legalBalls / 6)) * 100) / 100 : 0,
      };
    });

    res.json({ data });
  } catch (error) {
    console.error("Error fetching top bowlers:", error);
    res.status(500).json({ error: "Failed to fetch bowling stats" });
  }
});

export default router;