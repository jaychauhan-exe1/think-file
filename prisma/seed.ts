import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from "pg";
import 'dotenv/config'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Jay",
    email: "jaychauhan.exe@gmail.com",
    username: "jay",
    role: "admin",

  },
  {
    name: "Test",
    email: "test@test.com",
    username: "test",
    role: "admin",
  },
];

export async function main() {
  try {
    for (const u of userData) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: u,
        create: u,
      });
    }
    console.log("Seeding successful");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
