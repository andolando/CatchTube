-- AlterTable
ALTER TABLE "PlaylistItem" ADD COLUMN     "lastFailedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PlaylistItem_syncStatus_retryCount_idx" ON "PlaylistItem"("syncStatus", "retryCount");
