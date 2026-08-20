-- CreateTable
CREATE TABLE "SampleAuditRecord" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditorId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "SampleAuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleAuditRecord_exerciseId_idx" ON "SampleAuditRecord"("exerciseId");

-- AddForeignKey
ALTER TABLE "SampleAuditRecord" ADD CONSTRAINT "SampleAuditRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleAuditRecord" ADD CONSTRAINT "SampleAuditRecord_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
