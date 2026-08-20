-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "marksJson" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sourcesJson" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "verification" TEXT NOT NULL DEFAULT 'BEST';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT';
