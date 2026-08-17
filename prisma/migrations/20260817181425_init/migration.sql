-- CreateEnum
CREATE TYPE "QuestionPhase" AS ENUM ('PHASE_1', 'PHASE_2');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('LOBBY', 'PHASE1_INTERSTITIAL', 'PHASE1_QUESTION', 'PHASE1_TIEBREAK', 'PHASE1_QUALIFIERS_REVEAL', 'PHASE2_LOBBY', 'PHASE2_QUESTION', 'PHASE2_TIEBREAK', 'FINALE');

-- CreateEnum
CREATE TYPE "LifelineType" AS ENUM ('FIFTY_FIFTY', 'ASK_AUDIENCE', 'ASK_EXPERT');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "manualRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "phase" "QuestionPhase" NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "topic" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "presentedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_state" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'LOBBY',
    "currentQuestionId" TEXT,
    "activeTeamId" TEXT,
    "questionStartedAt" TIMESTAMP(3),
    "lockedOptionIndex" INTEGER,
    "answerRevealedAt" TIMESTAMP(3),
    "hiddenOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAnswer" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "responseTimeMs" INTEGER,

    CONSTRAINT "TeamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifelineUsage" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "LifelineType" NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifelineUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_eventId_name_key" ON "Team"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_eventId_phase_order_key" ON "Question"("eventId", "phase", "order");

-- CreateIndex
CREATE UNIQUE INDEX "game_state_eventId_key" ON "game_state"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamAnswer_teamId_questionId_key" ON "TeamAnswer"("teamId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "LifelineUsage_teamId_type_key" ON "LifelineUsage"("teamId", "type");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_state" ADD CONSTRAINT "game_state_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_state" ADD CONSTRAINT "game_state_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_state" ADD CONSTRAINT "game_state_activeTeamId_fkey" FOREIGN KEY ("activeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAnswer" ADD CONSTRAINT "TeamAnswer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAnswer" ADD CONSTRAINT "TeamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifelineUsage" ADD CONSTRAINT "LifelineUsage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifelineUsage" ADD CONSTRAINT "LifelineUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

