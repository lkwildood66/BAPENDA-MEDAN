import { PrismaClient } from "@prisma/client";

async function checkDatabase(name: string, url: string) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    console.log(`--- Checking ${name} database ---`);
    const users = await prisma.user.count();
    const news = await prisma.news.count();
    const announcements = await prisma.announcement.count();
    const taxObjects = await prisma.taxObject.count();
    const payments = await prisma.payment.count();

    console.log(`Users: ${users}`);
    console.log(`News: ${news}`);
    console.log(`Announcements: ${announcements}`);
    console.log(`Tax Objects: ${taxObjects}`);
    console.log(`Payments: ${payments}`);
  } catch (error) {
    console.error(`Error checking ${name}:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const neonUrl = "postgresql://neondb_owner:npg_0m8kDxgnLXKG@ep-lively-snow-atwltqux.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const railwayUrl = "postgresql://postgres:RpjBjaTfKiUdWCtCyuiElkpMUZhOspab@thomas.proxy.rlwy.net:30802/railway";

  await checkDatabase("Neon (Local .env)", neonUrl);
  console.log();
  await checkDatabase("Railway (check_remote_users)", railwayUrl);
}

main();
