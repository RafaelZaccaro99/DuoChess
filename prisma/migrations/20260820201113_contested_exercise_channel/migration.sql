-- CreateTable
CREATE TABLE "ContestedReport" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolverId" TEXT,
    "resolutionNotes" TEXT,

    CONSTRAINT "ContestedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestedReport_exerciseId_status_idx" ON "ContestedReport"("exerciseId", "status");

-- AddForeignKey
ALTER TABLE "ContestedReport" ADD CONSTRAINT "ContestedReport_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestedReport" ADD CONSTRAINT "ContestedReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestedReport" ADD CONSTRAINT "ContestedReport_resolverId_fkey" FOREIGN KEY ("resolverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
