import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "wp@mail.com" } });
  if (!user) { console.log("User not found"); return; }

  const objects = await prisma.taxObject.findMany({ where: { ownerId: user.id } });
  const existing = await prisma.payment.findMany({ where: { userId: user.id, status: "PENDING" } });

  if (existing.length >= 3) {
    console.log(`Sudah ada ${existing.length} tagihan PENDING:`);
    for (const p of existing) console.log(`  - ${p.invoiceNumber} Rp ${Number(p.amount).toLocaleString("id-ID")}`);
    await prisma.$disconnect();
    return;
  }

  const needed = 3 - existing.length;
  const usedObjects = objects.filter((o) => !existing.some((p) => p.taxObjectId === o.id));
  const amounts = [2450000, 1850000, 3200000, 975000, 4500000, 2100000];

  for (let i = 0; i < Math.min(needed, usedObjects.length); i++) {
    const obj = usedObjects[i];
    const amount = amounts[i % amounts.length];
    const pay = await prisma.payment.create({
      data: {
        invoiceNumber: "INV-TEST-" + Date.now() + "-" + i,
        amount,
        taxPeriod: "2026",
        status: "PENDING",
        expiredAt: new Date("2026-09-30T23:59:59Z"),
        notes: "Tagihan " + obj.type + " 2026",
        taxObjectId: obj.id,
        userId: user.id,
      },
    });
    console.log(`✅ ${pay.invoiceNumber} Rp ${Number(amount).toLocaleString("id-ID")} — ${obj.name}`);
  }

  const all = await prisma.payment.findMany({ where: { userId: user.id, status: "PENDING" } });
  console.log(`\nTotal tagihan PENDING: ${all.length}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
