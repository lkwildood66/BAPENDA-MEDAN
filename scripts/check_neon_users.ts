import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_0m8kDxgnLXKG@ep-lively-snow-atwltqux.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log("Connecting to Neon database...");
    const count = await prisma.user.count();
    console.log("Verification Success! Found users count in Neon:", count);
  } catch (error) {
    console.error("Neon check failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
