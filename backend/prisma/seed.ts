import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function toNullable(value: string): string | null {
  if (value === undefined || value === null || value === "" || value === "NA") {
    return null;
  }
  return value;
}

function toNullableInt(value: string): number | null {
  const v = toNullable(value);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function toNullableFloat(value: string): number | null {
  const v = toNullable(value);
  if (v === null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

async function seedMatches() {
  const filePath = path.join(__dirname, "..", "data", "matches.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Read ${records.length} rows from matches.csv`);

  for (const row of records) {
    await prisma.match.create({
      data: {
        id: parseInt(row.id, 10),
        season: row.season,
        city: toNullable(row.city),
        date: new Date(row.date),
        matchType: row.match_type,
        playerOfMatch: toNullable(row.player_of_match),
        venue: row.venue,
        team1: row.team1,
        team2: row.team2,
        tossWinner: row.toss_winner,
        tossDecision: row.toss_decision,
        winner: toNullable(row.winner),
        result: toNullable(row.result),
        resultMargin: toNullableInt(row.result_margin),
        targetRuns: toNullableInt(row.target_runs),
        targetOvers: toNullableFloat(row.target_overs),
        superOver: toNullable(row.super_over),
        method: toNullable(row.method),
        umpire1: toNullable(row.umpire1),
        umpire2: toNullable(row.umpire2),
      },
    });
  }

  console.log("Matches seeded successfully.");
}

async function seedDeliveries() {
  const filePath = path.join(__dirname, "..", "data", "deliveries.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Read ${records.length} rows from deliveries.csv`);

  const BATCH_SIZE = 1000;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const data = batch.map((row) => ({
      matchId: parseInt(row.match_id, 10),
      inning: parseInt(row.inning, 10),
      battingTeam: row.batting_team,
      bowlingTeam: row.bowling_team,
      over: parseInt(row.over, 10),
      ball: parseInt(row.ball, 10),
      batter: row.batter,
      bowler: row.bowler,
      nonStriker: row.non_striker,
      batsmanRuns: parseInt(row.batsman_runs, 10),
      extraRuns: parseInt(row.extra_runs, 10),
      totalRuns: parseInt(row.total_runs, 10),
      extrasType: toNullable(row.extras_type),
      isWicket: row.is_wicket === "1",
      playerDismissed: toNullable(row.player_dismissed),
      dismissalKind: toNullable(row.dismissal_kind),
      fielder: toNullable(row.fielder),
    }));

    await prisma.delivery.createMany({ data });
    inserted += data.length;
    console.log(`Inserted ${inserted} / ${records.length} deliveries`);
  }

  console.log("Deliveries seeded successfully.");
}

async function main() {
  console.log("Starting seed...");
  await seedMatches();
  await seedDeliveries();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
