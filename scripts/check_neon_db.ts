import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("Checking Neon DB counts...");
    const userCount = await prisma.user.count();
    const paymentCount = await prisma.payment.count();
    const paidPaymentCount = await prisma.payment.count({ where: { status: "PAID" } });
    const taxObjectCount = await prisma.taxObject.count();
    const newsCount = await prisma.news.count();

    console.log("Counts:", {
      userCount,
      paymentCount,
      paidPaymentCount,
      taxObjectCount,
      newsCount
    });
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
