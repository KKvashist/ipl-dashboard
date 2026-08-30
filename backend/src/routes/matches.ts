import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/matches?page=1&limit=20&season=2023&team=Mumbai Indians&search=final
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const season = req.query.season as string | undefined;
    const team = req.query.team as string | undefined;
    const search = req.query.search as string | undefined;

    const where: Prisma.MatchWhereInput = {};

    if (season) {
      where.season = season;
    }

    if (team) {
      where.OR = [
        { team1: { contains: team, mode: "insensitive" } },
        { team2: { contains: team, mode: "insensitive" } },
      ];
    }

    if (search) {
      const searchConditions: Prisma.MatchWhereInput[] = [
        { venue: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { team1: { contains: search, mode: "insensitive" } },
        { team2: { contains: search, mode: "insensitive" } },
        { playerOfMatch: { contains: search, mode: "insensitive" } },
      ];

      where.AND = [
        ...(where.AND ? (where.AND as Prisma.MatchWhereInput[]) : []),
        { OR: searchConditions },
      ];
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// GET /api/matches/:id — single match with its deliveries
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid match id" });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: { deliveries: true },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ error: "Failed to fetch match" });
  }
});

export default router;