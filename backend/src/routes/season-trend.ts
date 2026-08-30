// backend/src/routes/season-trend.ts
//
// Per-season aggregates feeding the Analytics page chart(s). All-time,
// one row per season, ordered oldest -> newest (natural for a trend line).
// Reuses the same conventions as dashboard.ts (totalWickets = ALL
// isWicket=true rows, including run outs — this is a general "wickets fell"
// count, not a bowler-credited count).

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

interface SeasonTrendRow {
  season: string;
  matches: bigint;
  totalRuns: bigint | null;
  totalWickets: bigint | null;
  totalSixes: bigint | null;
  totalFours: bigint | null;
  avgFirstInningsScore: number | null;
}

/**
 * @swagger
 * /api/season-trend:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get per-season aggregate stats for trend charts
 *     description: >
 *       One row per season (oldest to newest): matches played, total runs,
 *       total wickets, total sixes/fours, and average first-innings score.
 *       Intended to feed the Analytics page's season-over-season chart(s).
 *     responses:
 *       200:
 *         description: Season-by-season trend data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       season: { type: string, example: "2023" }
 *                       year: { type: integer, example: 2023 }
 *                       matches: { type: integer, example: 74 }
 *                       totalRuns: { type: integer, example: 21500 }
 *                       totalWickets: { type: integer, example: 850 }
 *                       totalSixes: { type: integer, example: 1150 }
 *                       totalFours: { type: integer, example: 2200 }
 *                       avgFirstInningsScore:
 *                         type: number
 *                         example: 178.4
 *       500:
 *         description: Failed to fetch season trend
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await prisma.$queryRaw<SeasonTrendRow[]>`
      WITH innings_totals AS (
        SELECT d."matchId", d.inning, m.season, SUM(d."totalRuns")::bigint AS score
        FROM "Delivery" d
        JOIN "Match" m ON m.id = d."matchId"
        GROUP BY d."matchId", d.inning, m.season
      ),
      first_innings AS (
        SELECT season, AVG(score) AS avg_first_innings_score
        FROM innings_totals
        WHERE inning = 1
        GROUP BY season
      ),
      season_deliveries AS (
        SELECT
          m.season,
          SUM(d."totalRuns")::bigint AS total_runs,
          SUM(CASE WHEN d."isWicket" = true THEN 1 ELSE 0 END)::bigint AS total_wickets,
          SUM(CASE WHEN d."batsmanRuns" = 6 THEN 1 ELSE 0 END)::bigint AS total_sixes,
          SUM(CASE WHEN d."batsmanRuns" = 4 THEN 1 ELSE 0 END)::bigint AS total_fours
        FROM "Delivery" d
        JOIN "Match" m ON m.id = d."matchId"
        GROUP BY m.season
      ),
      match_counts AS (
        SELECT season, COUNT(*)::bigint AS matches
        FROM "Match"
        GROUP BY season
      )
      SELECT
        mc.season,
        mc.matches,
        sd.total_runs AS "totalRuns",
        sd.total_wickets AS "totalWickets",
        sd.total_sixes AS "totalSixes",
        sd.total_fours AS "totalFours",
        fi.avg_first_innings_score AS "avgFirstInningsScore"
      FROM match_counts mc
      LEFT JOIN season_deliveries sd ON sd.season = mc.season
      LEFT JOIN first_innings fi ON fi.season = mc.season
      ORDER BY mc.season ASC
    `;

    const data = rows.map((r) => ({
      season: r.season,
      year: parseInt(r.season, 10),
      matches: Number(r.matches),
      totalRuns: Number(r.totalRuns ?? 0),
      totalWickets: Number(r.totalWickets ?? 0),
      totalSixes: Number(r.totalSixes ?? 0),
      totalFours: Number(r.totalFours ?? 0),
      avgFirstInningsScore:
        r.avgFirstInningsScore !== null ? Math.round(r.avgFirstInningsScore * 100) / 100 : null,
    }));

    res.json({ data });
  } catch (error) {
    console.error("Error fetching season trend:", error);
    res.status(500).json({ error: "Failed to fetch season trend" });
  }
});

export default router;