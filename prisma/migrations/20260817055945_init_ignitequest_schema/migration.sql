-- CreateEnum
CREATE TYPE "GamePhase" AS ENUM ('REGISTRATION', 'PHASE_1', 'PHASE_2', 'FINALE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "QuestionPhase" AS ENUM ('PHASE_1', 'PHASE_2');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'PREDICT_OUTPUT', 'DEBUG', 'WHICH_CODE_WORKS', 'WHAT_WOULD_YOU_CHANGE', 'SCENARIO', 'MULTI_CONCEPT');

-- CreateEnum
CREATE TYPE "LifelineType" AS ENUM ('FIFTY_FIFTY', 'ASK_AUDIENCE', 'ASK_EXPERT', 'SWITCH_QUESTION');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "phase" "QuestionPhase" NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "options" TEXT[],
    "correctOption" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "timeLimitSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameState" (
    "id" TEXT NOT NULL,
    "phase" "GamePhase" NOT NULL DEFAULT 'REGISTRATION',
    "questionStartedAt" TIMESTAMP(3),
    "questionRevealed" BOOLEAN NOT NULL DEFAULT false,
    "answerLocked" BOOLEAN NOT NULL DEFAULT false,
    "hiddenOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "currentQuestionId" TEXT,
    "activeTeamId" TEXT,

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAnswer" (
    "id" TEXT NOT NULL,
    "selectedOption" INTEGER,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTimeMs" INTEGER,
    "teamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "TeamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifelineUsage" (
    "id" TEXT NOT NULL,
    "type" "LifelineType" NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "replacementQuestionId" TEXT,

    CONSTRAINT "LifelineUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_eventId_name_key" ON "Team"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_eventId_pin_key" ON "Team"("eventId", "pin");

-- CreateIndex
CREATE UNIQUE INDEX "Question_eventId_phase_order_key" ON "Question"("eventId", "phase", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GameState_eventId_key" ON "GameState"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamAnswer_teamId_questionId_key" ON "TeamAnswer"("teamId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "LifelineUsage_teamId_type_key" ON "LifelineUsage"("teamId", "type");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_activeTeamId_fkey" FOREIGN KEY ("activeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAnswer" ADD CONSTRAINT "TeamAnswer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAnswer" ADD CONSTRAINT "TeamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifelineUsage" ADD CONSTRAINT "LifelineUsage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifelineUsage" ADD CONSTRAINT "LifelineUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifelineUsage" ADD CONSTRAINT "LifelineUsage_replacementQuestionId_fkey" FOREIGN KEY ("replacementQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

