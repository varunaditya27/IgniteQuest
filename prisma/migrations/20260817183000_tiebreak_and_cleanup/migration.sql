-- AlterTable
ALTER TABLE "game_state" ADD COLUMN     "tiebreakTeamIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "GamePhase";

-- DropEnum
DROP TYPE "QuestionType";

