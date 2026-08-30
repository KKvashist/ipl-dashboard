import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { canonicalTeamName } from "../utils/teamNames";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get every season with its champion, runner-up, and match count
 *     description: >
 *       Groups matches by season, then looks up each season's Final match
 *       to derive the champion (Final winner) and runner-up (Final loser).
 *       Franchise names are normalized via canonicalTeamName. If a season
 *       has no recorded Final (or no winner), champion/runnerUp fall back
 *       to "TBD".
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: List of seasons, most recent first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Raw season identifier as stored on the Match row
 *                     example: "2023"
 *                   year:
 *                     type: integer
 *                     example: 2023
 *                   champion:
 *                     type: string
 *                     example: Chennai Super Kings
 *                   runnerUp:
 *                     type: string
 *                     example: Gujarat Titans
 *                   matches:
 *                     type: integer
 *                     description: Total matches played that season
 *                     example: 74
 *       500:
 *         description: Failed to fetch seasons
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const seasons = await prisma.match.groupBy({
      by: ["season"],
      _count: { id: true },
      orderBy: { season: "desc" },
    });

    const result = await Promise.all(
      seasons.map(async (s) => {
        const final = await prisma.match.findFirst({
          where: { season: s.season, matchType: "Final" },
        });

        const champion = final?.winner ? canonicalTeamName(final.winner) : "TBD";
        let runnerUp = "TBD";
        if (final && final.winner) {
          const loserRaw = final.team1 === final.winner ? final.team2 : final.team1;
          runnerUp = canonicalTeamName(loserRaw);
        }

        return {
          id: s.season,
          year: parseInt(s.season, 10),
          champion,
          runnerUp,
          matches: s._count.id,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

export default router;