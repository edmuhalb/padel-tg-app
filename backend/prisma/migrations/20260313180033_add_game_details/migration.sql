-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "desiredLevel" "PlayerLevel",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "GameParticipant" ADD COLUMN     "comment" TEXT;
