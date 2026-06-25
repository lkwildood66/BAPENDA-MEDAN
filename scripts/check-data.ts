import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "wp@mail.com", label: "Wajib Pajak" },
    { email: "superadmin@bapenda.medan.go.id", label: "Super Admin" },
    { email: "petugas@bapendamedan.go.id", label: "Petugas" },
    { email: "mhs@usu.ac.id", label: "Mahasiswa" },
    { email: "dev@bapendamedan.go.id", label: "Developer" },
  ];

  for (const u of users) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      console.log(`❌ ${u.label} (${u.email}): NOT FOUND`);
      continue;
    }
    const objects = await prisma.taxObject.count({ where: { ownerId: user.id } });
    const payments = await prisma.payment.findMany({ where: { userId: user.id } });
    const pending = payments.filter(p => p.status === "PENDING");
    const paid = payments.filter(p => p.status === "PAID");
    const sppt = await prisma.sppt.count({ where: { userId: user.id } });
    const submissions = await prisma.taxSubmission.count({ where: { userId: user.id } });
    const complaints = await prisma.complaint.count({ where: { userId: user.id } });

    console.log(`✅ ${u.label} (${user.email} / ${user.id})`);
    console.log(`   Role: ${user.role} | Objek: ${objects} | SPPT: ${sppt}`);
    console.log(`   Tagihan: ${payments.length} (${pending.length} PENDING, ${paid.length} PAID)`);
    console.log(`   Pengajuan: ${submissions} | Pengaduan: ${complaints}`);
    
    if (pending.length === 0 && objects > 0) {
      console.log(`   ⚠️  TIDAK ADA tagihan PENDING — membuat 1...`);
      const obj = await prisma.taxObject.findFirst({ where: { ownerId: user.id } });
      if (obj) {
        await prisma.payment.create({
          data: {
            invoiceNumber: `INV-${Date.now()}-${user.id.slice(-4)}`,
            amount: 2450000 + Math.floor(Math.random() * 5000000),
            taxPeriod: "2026",
            status: "PENDING",
            expiredAt: new Date("2026-09-30T23:59:59Z"),
            notes: `Tagihan ${obj.type} 2026`,
            taxObjectId: obj.id,
            userId: user.id,
          },
        });
        console.log(`   ✅ Tagihan PENDING baru dibuat`);
      }
    }
    console.log("");
  }

  // Full stats
  const totalUsers = await prisma.user.count();
  const totalObjects = await prisma.taxObject.count();
  const totalPayments = await prisma.payment.count();
  const totalPending = await prisma.payment.count({ where: { status: "PENDING" } });
  const totalPaid = await prisma.payment.count({ where: { status: "PAID" } });
  const totalSppt = await prisma.sppt.count();
  const totalNews = await prisma.news.count();
  const totalAnnouncements = await prisma.announcement.count();
  const totalComplaints = await prisma.complaint.count();
  const totalSubmissions = await prisma.taxSubmission.count();
  const totalPpid = await prisma.pPIDRequest.count();
  const totalResearch = await prisma.researchRequest.count();
  const totalNotifications = await prisma.notification.count();
  const totalAudit = await prisma.auditLog.count();
  const totalZones = await prisma.landValueZone.count();
  const totalMarket = await prisma.propertyMarket.count();
  const totalAssessments = await prisma.taxAssessment.count();

  console.log("═══════════════════════════════════════");
  console.log("  DATABASE SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`  Users:           ${totalUsers}`);
  console.log(`  Tax Objects:     ${totalObjects}`);
  console.log(`  Payments:        ${totalPayments} (${totalPending} PENDING, ${totalPaid} PAID)`);
  console.log(`  SPPT:            ${totalSppt}`);
  console.log(`  News:            ${totalNews}`);
  console.log(`  Announcements:   ${totalAnnouncements}`);
  console.log(`  Complaints:      ${totalComplaints}`);
  console.log(`  Submissions:     ${totalSubmissions}`);
  console.log(`  PPID:            ${totalPpid}`);
  console.log(`  Research:        ${totalResearch}`);
  console.log(`  Notifications:   ${totalNotifications}`);
  console.log(`  Audit Logs:      ${totalAudit}`);
  console.log(`  ZNT Zones:       ${totalZones}`);
  console.log(`  Property Market: ${totalMarket}`);
  console.log(`  Assessments:     ${totalAssessments}`);
  console.log("═══════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
