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
    console.log("Checking admin users in Neon...");
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN"
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true
      }
    });

    console.log("Found admins in Neon:", admins);
  } catch (error) {
    console.error("Error finding admins in Neon:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
