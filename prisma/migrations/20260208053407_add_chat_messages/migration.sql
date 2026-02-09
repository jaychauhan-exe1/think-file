-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filebookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_filebookId_fkey" FOREIGN KEY ("filebookId") REFERENCES "filebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
