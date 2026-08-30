import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { canonicalTeamName } from "../utils/teamNames";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get aggregated win/loss/title stats for every franchise
 *     description: >
 *       Aggregates every match's team1/team2/winner across all seasons,
 *       normalizing legacy franchise names (e.g. "Kings XI Punjab" ->
 *       "Punjab Kings") to a single canonical entry. Title counts are
 *       computed from Final-match winners only.
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams with aggregated stats, sorted by matches played (desc)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: URL-safe slug derived from the team name
 *                     example: mumbai-indians
 *                   name:
 *                     type: string
 *                     example: Mumbai Indians
 *                   shortName:
 *                     type: string
 *                     description: Initials derived from the team name
 *                     example: MI
 *                   color:
 *                     type: string
 *                     description: Hex color for UI theming; falls back to a neutral gray if unmapped
 *                     example: "#004BA0"
 *                   matchesPlayed:
 *                     type: integer
 *                     example: 234
 *                   wins:
 *                     type: integer
 *                     example: 130
 *                   losses:
 *                     type: integer
 *                     example: 104
 *                   titles:
 *                     type: integer
 *                     description: Number of seasons this franchise won the Final
 *                     example: 5
 *       500:
 *         description: Failed to fetch teams
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      select: { team1: true, team2: true, winner: true },
    });

    const teamStats: Record<string, { matches: number; wins: number }> = {};

    for (const m of matches) {
      // Normalize both sides to their canonical (current) franchise name so
      // e.g. "Kings XI Punjab" and "Punjab Kings" accumulate into one entry.
      const team1 = canonicalTeamName(m.team1);
      const team2 = canonicalTeamName(m.team2);
      const winner = m.winner ? canonicalTeamName(m.winner) : null;

      for (const team of [team1, team2]) {
        if (!teamStats[team]) {
          teamStats[team] = { matches: 0, wins: 0 };
        }
        teamStats[team].matches += 1;
        if (winner === team) {
          teamStats[team].wins += 1;
        }
      }
    }

    // Real title counts: one title per season where this team won the Final.
    const finals = await prisma.match.findMany({
      where: { matchType: "Final" },
      select: { season: true, winner: true },
    });

    const titleCounts: Record<string, number> = {};
    for (const f of finals) {
      if (!f.winner) continue;
      const champion = canonicalTeamName(f.winner);
      titleCounts[champion] = (titleCounts[champion] ?? 0) + 1;
    }

    const colors: Record<string, string> = {
      "Mumbai Indians": "#004BA0",
      "Chennai Super Kings": "#F9CD05",
      "Royal Challengers Bengaluru": "#EC1C24",
      "Kolkata Knight Riders": "#3A225D",
      "Sunrisers Hyderabad": "#F7A721",
      "Delhi Capitals": "#17479E",
      "Punjab Kings": "#ED1B24",
      "Rajasthan Royals": "#254AA5",
      "Gujarat Titans": "#1B2133",
      "Lucknow Super Giants": "#A72056",
      "Deccan Chargers": "#B7A05C",
      "Pune Warriors India": "#8A2BE2",
      "Rising Pune Supergiant": "#E4572E",
      "Rising Pune Supergiants": "#E4572E",
      "Gujarat Lions": "#F65C1B",
    };

    const result = Object.entries(teamStats)
      .map(([name, stats]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        shortName: name
          .split(" ")
          .map((w) => w[0])
          .join(""),
        color: colors[name] ?? "#4B5563",
        matchesPlayed: stats.matches,
        wins: stats.wins,
        losses: stats.matches - stats.wins,
        titles: titleCounts[name] ?? 0,
      }))
      .sort((a, b) => b.matchesPlayed - a.matchesPlayed);

    res.json(result);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

export default router;