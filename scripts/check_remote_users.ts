import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:RpjBjaTfKiUdWCtCyuiElkpMUZhOspab@thomas.proxy.rlwy.net:30802/railway"
      }
    }
  });

  try {
    console.log("Connecting to Railway database to verify users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true
      }
    });

    console.log("Verification Success! Found users:", users.length);
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
