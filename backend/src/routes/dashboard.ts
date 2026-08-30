// backend/src/routes/dashboard.ts
//
// Headline aggregate stats for the Dashboard landing page. All-time only
// (no season filter) per assignment scope. Reuses the same conventions as
// players.ts:
//   - bowler "wickets" exclude run outs (dismissalKind != 'run out'), since
//     a run out isn't credited to the bowler.
//   - "totalWickets" (the general headline number) counts ALL isWicket=true
//     rows, including run outs, since that's a wicket falling in the match
//     regardless of who it's credited to.
//   - team names are passed through canonicalTeamName so rebranded
//     franchises (e.g. "Kings XI Punjab" -> "Punjab Kings") roll up together,
//     consistent with /api/teams and /api/seasons.

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { canonicalTeamName } from "../utils/teamNames";

const router = Router();
const prisma = new PrismaClient();

interface DeliveryTotalsRow {
  totalRuns: bigint;
  totalWickets: bigint;
  totalSixes: bigint;
  totalFours: bigint;
}

interface HighestTeamScoreRow {
  matchId: number;
  inning: number;
  battingTeam: string;
  score: bigint;
  season: string;
}

interface HighestIndividualScoreRow {
  matchId: number;
  inning: number;
  batter: string;
  runs: bigint;
  season: string;
}

interface TopRunScorerRow {
  player: string;
  runs: bigint;
  team: string | null;
}

interface TopWicketTakerRow {
  player: string;
  wickets: bigint;
  team: string | null;
}

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get headline aggregate stats across all matches and seasons
 *     description: >
 *       All-time summary (no season filter) combining match counts, raw
 *       delivery-level totals (runs/wickets/fours/sixes), single-innings
 *       records (highest team score, highest individual score), the most
 *       decorated franchise (by Final wins), and the current career leaders
 *       in runs and wickets.
 *     responses:
 *       200:
 *         description: Dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMatches: { type: integer, example: 1095 }
 *                 totalSeasons: { type: integer, example: 18 }
 *                 totalRuns: { type: integer, example: 297000 }
 *                 totalWickets: { type: integer, example: 11800 }
 *                 totalSixes: { type: integer, example: 15200 }
 *                 totalFours: { type: integer, example: 30500 }
 *                 highestTeamScore:
 *                   type: object
 *                   properties:
 *                     team: { type: string, example: Royal Challengers Bengaluru }
 *                     score: { type: integer, example: 263 }
 *                     season: { type: string, example: "2013" }
 *                 highestIndividualScore:
 *                   type: object
 *                   properties:
 *                     player: { type: string, example: Chris Gayle }
 *                     runs: { type: integer, example: 175 }
 *                     season: { type: string, example: "2013" }
 *                 mostTitles:
 *                   type: object
 *                   properties:
 *                     team: { type: string, example: Chennai Super Kings }
 *                     titles: { type: integer, example: 5 }
 *                 mostRunsCareer:
 *                   type: object
 *                   properties:
 *                     player: { type: string, example: Virat Kohli }
 *                     team: { type: string, example: Royal Challengers Bengaluru }
 *                     runs: { type: integer, example: 8000 }
 *                 mostWicketsCareer:
 *                   type: object
 *                   properties:
 *                     player: { type: string, example: Yuzvendra Chahal }
 *                     team: { type: string, example: Rajasthan Royals }
 *                     wickets: { type: integer, example: 200 }
 *       500:
 *         description: Failed to fetch dashboard summary
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const totalMatches = await prisma.match.count();

    const seasonGroups = await prisma.match.groupBy({ by: ["season"] });
    const totalSeasons = seasonGroups.length;

    const [totals] = await prisma.$queryRaw<DeliveryTotalsRow[]>`
      SELECT
        SUM("totalRuns")::bigint AS "totalRuns",
        SUM(CASE WHEN "isWicket" = true THEN 1 ELSE 0 END)::bigint AS "totalWickets",
        SUM(CASE WHEN "batsmanRuns" = 6 THEN 1 ELSE 0 END)::bigint AS "totalSixes",
        SUM(CASE WHEN "batsmanRuns" = 4 THEN 1 ELSE 0 END)::bigint AS "totalFours"
      FROM "Delivery"
    `;

    const [highestTeamScoreRow] = await prisma.$queryRaw<HighestTeamScoreRow[]>`
      WITH innings_totals AS (
        SELECT "matchId", inning, "battingTeam", SUM("totalRuns")::bigint AS score
        FROM "Delivery"
        GROUP BY "matchId", inning, "battingTeam"
      )
      SELECT it."matchId", it.inning, it."battingTeam", it.score, m.season
      FROM innings_totals it
      JOIN "Match" m ON m.id = it."matchId"
      ORDER BY it.score DESC
      LIMIT 1
    `;

    const [highestIndividualScoreRow] = await prisma.$queryRaw<HighestIndividualScoreRow[]>`
      WITH batting_innings AS (
        SELECT "matchId", inning, batter, SUM("batsmanRuns")::bigint AS runs
        FROM "Delivery"
        WHERE batter IS NOT NULL
        GROUP BY "matchId", inning, batter
      )
      SELECT bi."matchId", bi.inning, bi.batter, bi.runs, m.season
      FROM batting_innings bi
      JOIN "Match" m ON m.id = bi."matchId"
      ORDER BY bi.runs DESC
      LIMIT 1
    `;

    // Most titles: same logic as /api/teams — one title per season where a
    // team won the Final, names rolled up through canonicalTeamName.
    const finals = await prisma.match.findMany({
      where: { matchType: "Final" },
      select: { winner: true },
    });
    const titleCounts: Record<string, number> = {};
    for (const f of finals) {
      if (!f.winner) continue;
      const champion = canonicalTeamName(f.winner);
      titleCounts[champion] = (titleCounts[champion] ?? 0) + 1;
    }
    const mostTitlesEntry = Object.entries(titleCounts).sort((a, b) => b[1] - a[1])[0];

    const [topRunScorer] = await prisma.$queryRaw<TopRunScorerRow[]>`
      WITH batting AS (
        SELECT batter AS player, SUM("batsmanRuns")::bigint AS runs
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
      SELECT b.player, b.runs, pt.team
      FROM batting b
      LEFT JOIN primary_team pt ON pt.player = b.player
      ORDER BY b.runs DESC
      LIMIT 1
    `;

    const [topWicketTaker] = await prisma.$queryRaw<TopWicketTakerRow[]>`
      WITH bowling_ball AS (
        SELECT
          bowler,
          "bowlingTeam",
          CASE WHEN "isWicket" = true AND "dismissalKind" IS DISTINCT FROM 'run out'
               THEN 1 ELSE 0 END AS is_wkt
        FROM "Delivery"
        WHERE bowler IS NOT NULL
      ),
      bowling AS (
        SELECT bowler AS player, SUM(is_wkt)::bigint AS wickets
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
      SELECT bw.player, bw.wickets, pt.team
      FROM bowling bw
      LEFT JOIN primary_team pt ON pt.player = bw.player
      ORDER BY bw.wickets DESC
      LIMIT 1
    `;

    res.json({
      totalMatches,
      totalSeasons,
      totalRuns: Number(totals?.totalRuns ?? 0),
      totalWickets: Number(totals?.totalWickets ?? 0),
      totalSixes: Number(totals?.totalSixes ?? 0),
      totalFours: Number(totals?.totalFours ?? 0),
      highestTeamScore: highestTeamScoreRow
        ? {
            team: canonicalTeamName(highestTeamScoreRow.battingTeam),
            score: Number(highestTeamScoreRow.score),
            season: highestTeamScoreRow.season,
          }
        : null,
      highestIndividualScore: highestIndividualScoreRow
        ? {
            player: highestIndividualScoreRow.batter,
            runs: Number(highestIndividualScoreRow.runs),
            season: highestIndividualScoreRow.season,
          }
        : null,
      mostTitles: mostTitlesEntry
        ? { team: mostTitlesEntry[0], titles: mostTitlesEntry[1] }
        : null,
      mostRunsCareer: topRunScorer
        ? {
            player: topRunScorer.player,
            team: topRunScorer.team ? canonicalTeamName(topRunScorer.team) : "Unknown",
            runs: Number(topRunScorer.runs),
          }
        : null,
      mostWicketsCareer: topWicketTaker
        ? {
            player: topWicketTaker.player,
            team: topWicketTaker.team ? canonicalTeamName(topWicketTaker.team) : "Unknown",
            wickets: Number(topWicketTaker.wickets),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;