-- AlterTable
ALTER TABLE "user" ADD COLUMN     "autoSummarization" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "compactSidebar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deepReasoningMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inAppNotifs" BOOLEAN NOT NULL DEFAULT true;
