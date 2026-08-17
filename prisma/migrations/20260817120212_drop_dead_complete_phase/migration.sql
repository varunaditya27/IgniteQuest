-- AlterEnum
BEGIN;
CREATE TYPE "GamePhase_new" AS ENUM ('REGISTRATION', 'PHASE_1', 'PHASE_2', 'FINALE');
ALTER TABLE "GameState" ALTER COLUMN "phase" DROP DEFAULT;
ALTER TABLE "GameState" ALTER COLUMN "phase" TYPE "GamePhase_new" USING ("phase"::text::"GamePhase_new");
ALTER TYPE "GamePhase" RENAME TO "GamePhase_old";
ALTER TYPE "GamePhase_new" RENAME TO "GamePhase";
DROP TYPE "GamePhase_old";
ALTER TABLE "GameState" ALTER COLUMN "phase" SET DEFAULT 'REGISTRATION';
COMMIT;
