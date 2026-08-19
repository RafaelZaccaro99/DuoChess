-- AlterTable
ALTER TABLE "ErrorClassification" ADD COLUMN     "attemptId" TEXT,
ADD COLUMN     "skillId" TEXT,
ALTER COLUMN "analysisId" DROP NOT NULL,
ALTER COLUMN "ply" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ErrorClassification" ADD CONSTRAINT "ErrorClassification_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExerciseAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
