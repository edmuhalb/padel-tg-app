-- CreateEnum
CREATE TYPE "PlayerLevel" AS ENUM ('NONE', 'BEGINNER', 'CONFIDENT', 'EXPERIENCED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" "PlayerLevel" NOT NULL DEFAULT 'NONE';
