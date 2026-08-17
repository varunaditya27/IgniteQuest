-- AlterTable
ALTER TABLE "GameState" ADD COLUMN     "turnNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "presentedAt" TIMESTAMP(3);
