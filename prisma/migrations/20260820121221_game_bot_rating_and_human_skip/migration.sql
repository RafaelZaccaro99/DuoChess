-- AlterTable
ALTER TABLE "CriticalMoment" ADD COLUMN     "humanSkipped" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "botRating" INTEGER;
