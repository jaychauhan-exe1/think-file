-- AlterTable
ALTER TABLE "filebook" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeaturedRequest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'FREE';
