-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "city" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "matchType" TEXT NOT NULL,
    "playerOfMatch" TEXT,
    "venue" TEXT NOT NULL,
    "team1" TEXT NOT NULL,
    "team2" TEXT NOT NULL,
    "tossWinner" TEXT NOT NULL,
    "tossDecision" TEXT NOT NULL,
    "winner" TEXT,
    "result" TEXT,
    "resultMargin" INTEGER,
    "targetRuns" INTEGER,
    "targetOvers" DOUBLE PRECISION,
    "superOver" TEXT,
    "method" TEXT,
    "umpire1" TEXT,
    "umpire2" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "inning" INTEGER NOT NULL,
    "battingTeam" TEXT NOT NULL,
    "bowlingTeam" TEXT NOT NULL,
    "over" INTEGER NOT NULL,
    "ball" INTEGER NOT NULL,
    "batter" TEXT NOT NULL,
    "bowler" TEXT NOT NULL,
    "nonStriker" TEXT NOT NULL,
    "batsmanRuns" INTEGER NOT NULL,
    "extraRuns" INTEGER NOT NULL,
    "totalRuns" INTEGER NOT NULL,
    "extrasType" TEXT,
    "isWicket" BOOLEAN NOT NULL,
    "playerDismissed" TEXT,
    "dismissalKind" TEXT,
    "fielder" TEXT,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_season_idx" ON "Match"("season");

-- CreateIndex
CREATE INDEX "Match_team1_idx" ON "Match"("team1");

-- CreateIndex
CREATE INDEX "Match_team2_idx" ON "Match"("team2");

-- CreateIndex
CREATE INDEX "Delivery_matchId_idx" ON "Delivery"("matchId");

-- CreateIndex
CREATE INDEX "Delivery_batter_idx" ON "Delivery"("batter");

-- CreateIndex
CREATE INDEX "Delivery_bowler_idx" ON "Delivery"("bowler");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
