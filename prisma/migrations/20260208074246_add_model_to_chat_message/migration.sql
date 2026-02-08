/*
  Warnings:

  - You are about to drop the `daily_usage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "daily_usage" DROP CONSTRAINT "daily_usage_userId_fkey";

-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "model" TEXT;

-- DropTable
DROP TABLE "daily_usage";
