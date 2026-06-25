import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Constants ─────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT_WINDOW = 10_000;
const MAX_REQUESTS_PER_WINDOW = 15;
const PROMPT_INJECTION_PATTERNS = [
  /lupakan\s+sistem/i, /abaikan\s+petunjuk/i, /ignore\s+instructions/i,
  /kamu\s+adalah\s+ai/i, /kamu\s+harus\s+bertindak/i, /system\s+prompt/i,
  /kamu\s+boleh\s+melakukan/i, /sekarang\s+kamu\s+adalah/i,
];

interface BotReply {
  message: string;
  suggestions: string[];
}

interface SessionUser {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function santizeInput(text: string): string {
  return text.replace(/[<>]/g, "").trim().slice(0, MAX_MESSAGE_LENGTH);
}

function isSpam(query: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((p) => p.test(query));
}

function getRoleLabel(role: string | null | undefined): string {
  const labels: Record<string, string> = {
    DEVELOPER: "Super Admin",
    ADMIN: "Admin",
    OFFICER: "Petugas Lapangan",
    USER: "Wajib Pajak",
    MAHASISWA: "Mahasiswa",
  };
  return labels[role ?? ""] || "Pengguna";
}

function fallbackReply(suggestions: string[]): BotReply {
  return {
    message:
      "Maaf, saya belum menemukan jawaban yang tepat untuk pertanyaan Anda.\n\nSilakan coba gunakan kata kunci lain atau pilih salah satu menu di bawah ini:",
    suggestions,
  };
}

function loggedOutReply(action: string): BotReply {
  return {
    message: `Untuk ${action}, Anda harus masuk ke akun terlebih dahulu.\n\nSilakan klik tombol **Masuk Portal** di pojok kanan atas halaman ini untuk login.`,
    suggestions: ["Bagaimana cara login?", "Buat akun baru", "Alamat kantor Bapenda", "Cek tagihan saya"],
  };
}

// ─── Role-based database queries ───────────────────────────────────────────

async function superAdminStats() {
  const [totalUsers, activeUsers, adminCount, officerCount, wpCount, newsCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "OFFICER" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.news.count({ where: { isActive: true } }),
  ]);
  return {
    message: `📊 *Dashboard Sistem BAPENDA.HUB*\n\n` +
      `• Total Pengguna: *${totalUsers}*\n` +
      `• Pengguna Aktif: *${activeUsers}*\n` +
      `• Admin: *${adminCount}*\n` +
      `• Petugas Lapangan: *${officerCount}*\n` +
      `• Wajib Pajak: *${wpCount}*\n` +
      `• Berita Terbit: *${newsCount}*\n\n` +
      `Sistem berjalan dengan baik.`,
    suggestions: ["Detail audit log", "Total pembayaran bulan ini", "Monitor pengajuan pending"],
  };
}

async function adminStats() {
  const [wpCount, pendingSubmissions, totalPayments, totalPaymentsAmount, taxObjectCount, complaintsOpen] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.taxSubmission.count({ where: { status: "PENDING" } }),
      prisma.payment.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.taxObject.count(),
      prisma.complaint.count({ where: { status: "OPEN" } }),
    ]);
  return {
    message: `📊 *Ringkasan Data BAPENDA*\n\n` +
      `• Wajib Pajak Terdaftar: *${wpCount}*\n` +
      `• Objek Pajak: *${taxObjectCount}*\n` +
      `• Pengajuan Pending: *${pendingSubmissions}*\n` +
      `• Total Pembayaran: *${totalPayments} transaksi*\n` +
      `• Nominal Pembayaran: *Rp ${Number(totalPaymentsAmount._sum.amount ?? 0).toLocaleString("id-ID")}*\n` +
      `• Pengaduan Terbuka: *${complaintsOpen}*\n\n` +
      `Silakan buka dashboard Admin untuk detail lebih lanjut.`,
    suggestions: ["Data pengajuan pending", "Rekap pembayaran", "Daftar pengaduan", "Statistik pajak daerah"],
  };
}

async function officerStats(userId: string) {
  const [assessments, mySurveys] = await Promise.all([
    prisma.taxAssessment.count({ where: { assessorId: userId } }),
    prisma.taxAssessment.count({ where: { assessorId: userId, assessmentDate: { gte: new Date(Date.now() - 30 * 86400000) } } }),
  ]);
  return {
    message: `📊 *Ringkasan Aktivitas Petugas*\n\n` +
      `• Total Penilaian: *${assessments}*\n` +
      `• Penilaian 30 Hari: *${mySurveys}*\n\n` +
      `Gunakan menu **Pendataan** di dashboard untuk memulai penilaian baru.`,
    suggestions: ["Mulai penilaian baru", "Data objek pajak", "Riwayat penilaian saya"],
  };
}

async function wpTagihan(userId: string): Promise<BotReply> {
  const pending = await prisma.payment.findMany({
    where: { userId, status: "PENDING" },
    include: { taxObject: true },
    take: 5,
    orderBy: { expiredAt: "asc" },
  });
  if (pending.length === 0) {
    return {
      message: "✅ Anda tidak memiliki tagihan aktif yang belum dibayar. Semua pajak Anda sudah lunas!",
      suggestions: ["Lihat SPPT saya", "Riwayat pembayaran", "Cara bayar pajak"],
    };
  }
  const list = pending
    .map(
      (p, i) =>
        `${i + 1}. *${p.taxObject?.name || "Objek Pajak"}*\n` +
        `   NOP: ${p.taxObject?.nop || "-"}\n` +
        `   Tagihan: *Rp ${Number(p.amount).toLocaleString("id-ID")}*\n` +
        `   Jatuh Tempo: ${new Date(p.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
    )
    .join("\n\n");
  const total = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  return {
    message: `📋 *Tagihan Aktif Anda*\n\n${list}\n\n*Total Tunggakan: Rp ${total.toLocaleString("id-ID")}*\n\nSilakan segera lakukan pembayaran sebelum jatuh tempo.`,
    suggestions: ["Bayar tagihan sekarang", "Lihat SPPT saya", "Riwayat pembayaran"],
  };
}

async function wpSppt(userId: string): Promise<BotReply> {
  const sppts = await prisma.sppt.findMany({
    where: { userId },
    include: { taxObject: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  if (sppts.length === 0) {
    return {
      message: "Belum ada dokumen SPPT yang terdaftar atas akun Anda. Pastikan NOP Anda telah terdaftar di sistem.",
      suggestions: ["Cara cek NOP", "Hubungi petugas", "Cek tagihan saya"],
    };
  }
  const list = sppts
    .map(
      (s) =>
        `• *${s.taxObject?.name || "Objek Pajak"}* — Tahun ${s.taxPeriod}\n` +
        `  NOP: ${s.taxObject?.nop || "-"} | Ketetapan: Rp ${Number(s.taxObjectVal).toLocaleString("id-ID")}`
    )
    .join("\n\n");
  return {
    message: `📄 *Dokumen SPPT Digital*\n\n${list}\n\nAnda dapat mengunduh SPPT melalui menu **SPPT Saya** di dashboard.`,
    suggestions: ["Unduh SPPT", "Cek tagihan saya", "Cara bayar pajak"],
  };
}

async function wpSubmissions(userId: string): Promise<BotReply> {
  const submissions = await prisma.taxSubmission.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  if (submissions.length === 0) {
    return {
      message: "Anda belum memiliki riwayat pengajuan. Silakan buat pengajuan baru di dashboard.",
      suggestions: ["Cara buat pengajuan", "Buat pengajuan baru", "Hubungi petugas"],
    };
  }
  const statusMap: Record<string, string> = {
    PENDING: "⏳ Menunggu Verifikasi",
    IN_PROGRESS: "🔧 Diproses",
    APPROVED: "✅ Disetujui",
    REJECTED: "❌ Ditolak",
  };
  const list = submissions
    .map(
      (s) =>
        `• *${s.title}* (No: ${s.ticketNumber})\n` +
        `  Jenis: ${s.type === "KEBERATAN" ? "Keberatan" : "Perubahan Data"}\n` +
        `  Status: ${statusMap[s.status] || s.status}`
    )
    .join("\n\n");
  return {
    message: `📑 *Riwayat Pengajuan Anda*\n\n${list}`,
    suggestions: ["Buat pengajuan baru", "Cara mengajukan keberatan", "Hubungi petugas"],
  };
}

async function wpComplaints(userId: string): Promise<BotReply> {
  const complaints = await prisma.complaint.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  if (complaints.length === 0) {
    return {
      message: "Belum ada pengaduan yang Anda buat. Jika mengalami kendala, silakan buat pengaduan baru melalui dashboard.",
      suggestions: ["Buat pengaduan", "Hubungi petugas", "Alamat kantor Bapenda"],
    };
  }
  const statusMap: Record<string, string> = {
    OPEN: "📬 Terbuka",
    IN_PROGRESS: "🔧 Diproses",
    RESOLVED: "✅ Selesai",
    CLOSED: "🔒 Ditutup",
  };
  const list = complaints
    .map(
      (c) =>
        `• *${c.subject}* (No: ${c.ticketNumber})\n` +
        `  Kategori: ${c.category}\n` +
        `  Status: ${statusMap[c.status] || c.status}`
    )
    .join("\n\n");
  return {
    message: `📬 *Riwayat Pengaduan Anda*\n\n${list}`,
    suggestions: ["Buat pengaduan baru", "Hubungi petugas", "Alamat kantor Bapenda"],
  };
}

async function wpPayments(userId: string): Promise<BotReply> {
  const payments = await prisma.payment.findMany({
    where: { userId, status: "PAID" },
    include: { taxObject: true },
    take: 5,
    orderBy: { paidAt: "desc" },
  });
  if (payments.length === 0) {
    return {
      message: "Belum ada riwayat pembayaran yang tercatat atas akun Anda.",
      suggestions: ["Cek tagihan saya", "Cara bayar pajak", "Lihat SPPT"],
    };
  }
  const list = payments
    .map(
      (p) =>
        `• *${p.taxObject?.name || "Pembayaran"}* — ${p.taxPeriod}\n` +
        `  Rp ${Number(p.amount).toLocaleString("id-ID")} ✅ Lunas\n` +
        `  ${p.paidAt ? new Date(p.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}`
    )
    .join("\n\n");
  return {
    message: `🧾 *Riwayat Pembayaran*\n\n${list}`,
    suggestions: ["Cek tagihan saya", "Unduh SPPT", "Cara bayar pajak"],
  };
}

// ─── Main handler ──────────────────────────────────────────────────────────

async function getReply(query: string, session: SessionUser | null): Promise<BotReply> {
  const userId = session?.id ?? null;
  const role = session?.role ?? null;
  const roleLabel = getRoleLabel(role);

  // ─── Role-based queries ──────────────────────────────────────────────────

  // SUPER ADMIN (DEVELOPER)
  if (role === "DEVELOPER") {
    if (/statistik\s*sistem|dashboard\s*sistem|monitoring/i.test(query)) return superAdminStats();
    if (/audit\s*log/i.test(query)) {
      const logs = await prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } });
      return {
        message: `📋 *Audit Log Terbaru*\n\n${logs.map((l) => `• ${l.action} — ${new Date(l.createdAt).toLocaleDateString("id-ID")}`).join("\n") || "Belum ada data."}`,
        suggestions: ["Statistik sistem", "Monitoring pengguna", "Laporan kinerja"],
      };
    }
  }

  // ADMIN
  if (role === "ADMIN") {
    if (/statistik|ringkasan|data\s*sistem|rekap/i.test(query)) return adminStats();
    if (/pengajuan\s*(pending|masuk|baru)/i.test(query)) {
      const subs = await prisma.taxSubmission.findMany({ where: { status: "PENDING" }, take: 5, orderBy: { createdAt: "desc" } });
      return {
        message: `📑 *Pengajuan Pending*\n\n${subs.map((s) => `• ${s.title} (${s.ticketNumber}) — ${new Date(s.createdAt).toLocaleDateString("id-ID")}`).join("\n") || "Tidak ada pengajuan pending."}`,
        suggestions: ["Rekap pembayaran", "Statistik pajak", "Daftar pengaduan"],
      };
    }
    if (/pembayaran\s*(hari\s*ini|bulan\s*ini|rekap)/i.test(query)) {
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const paid = await prisma.payment.count({ where: { status: "PAID", paidAt: { gte: startOfMonth } } });
      const total = await prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amount: true } });
      return {
        message: `💰 *Rekap Pembayaran Bulan Ini*\n\nJumlah Transaksi: *${paid}*\nTotal Penerimaan: *Rp ${Number(total._sum.amount ?? 0).toLocaleString("id-ID")}*`,
        suggestions: ["Data pengajuan", "Statistik pajak daerah", "Ringkasan sistem"],
      };
    }
  }

  // OFFICER
  if (role === "OFFICER") {
    if (/aktivitas|ringkasan|tugas|pendataan/i.test(query)) return officerStats(userId!);
    if (/objek\s*pajak/i.test(query)) {
      const objects = await prisma.taxObject.findMany({ take: 5, orderBy: { updatedAt: "desc" }, include: { owner: { select: { name: true } } } });
      return {
        message: `🏠 *Data Objek Pajak*\n\n${objects.map((o) => `• ${o.name} — ${o.nop}\n  Pemilik: ${o.owner?.name || "-"} | ${o.address}`).join("\n\n") || "Belum ada data."}`,
        suggestions: ["Mulai penilaian baru", "Riwayat penilaian saya", "Verifikasi"],
      };
    }
  }

  // ─── WAJIB PAJAK (USER / MAHASISWA) ─────────────────────────────────────

  // Personal data queries (require auth) — broad keyword matching
  // in a tax chatbot context, mentioning the keyword = wanting that data
  if (/tagihan/i.test(query)) {
    if (!userId) return loggedOutReply("melihat tagihan");
    return wpTagihan(userId);
  }
  if (/sppt/i.test(query)) {
    if (!userId) return loggedOutReply("melihat SPPT digital");
    return wpSppt(userId);
  }
  if (/(pengajuan|permohonan)/i.test(query)) {
    if (!userId) return loggedOutReply("memantau pengajuan");
    return wpSubmissions(userId);
  }
  if (/(pengaduan|aduan|keluhan)/i.test(query)) {
    if (!userId) return loggedOutReply("melihat pengaduan");
    return wpComplaints(userId);
  }
  if (/riwayat\s*(pembayaran|bayar)|pembayaran\s*saya|histori\s*(pembayaran|bayar)/i.test(query)) {
    if (!userId) return loggedOutReply("melihat riwayat pembayaran");
    return wpPayments(userId);
  }
  if (/profil\s*saya|data\s*saya/i.test(query)) {
    if (!userId) return loggedOutReply("melihat profil");
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, nik: true, phone: true, address: true, role: true } });
    if (!user) return { message: "Data profil tidak ditemukan.", suggestions: ["Hubungi petugas", "Alamat kantor"] };
    return {
      message: `👤 *Profil Anda*\n\nNama: ${user.name || "-"}\nEmail: ${user.email || "-"}\nNIK: ${user.nik || "-"}\nTelepon: ${user.phone || "-"}\nAlamat: ${user.address || "-"}\nRole: ${getRoleLabel(user.role)}`,
      suggestions: ["Edit profil", "Cek tagihan saya", "Riwayat pembayaran"],
    };
  }

  // ─── Informasi Publik (no auth required) ────────────────────────────────

  // Berita & pengumuman
  if (/berita|pengumuman|info\s*terbaru|artikel|kabar/i.test(query)) {
    const [news, announcements] = await Promise.all([
      prisma.news.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 3 }),
      prisma.announcement.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    ]);
    let text = "";
    if (news.length) text += `📰 *Berita Terbaru*\n${news.map((n) => `• ${n.title}`).join("\n")}\n\n`;
    if (announcements.length) text += `📢 *Pengumuman*\n${announcements.map((a) => `• ${a.title}`).join("\n")}`;
    if (!text) text = "Belum ada berita atau pengumuman terbaru.";
    else text += "\n\nKunjungi halaman **Berita & Pengumuman** di portal SIPADA untuk detailnya.";
    return { message: text, suggestions: ["Cek tagihan saya", "Info tarif pajak", "Alamat kantor"] };
  }

  // Tarif & perhitungan PBB
  if (/tarif\s*pajak|berapa\s*pajak|cara\s*hitung|perhitungan|njop|pbb/i.test(query)) {
    return {
      message:
        `🧮 *Tarif & Perhitungan PBB-P2*\n\n` +
        `**NJOP** (Nilai Jual Objek Pajak) adalah dasar pengenaan PBB.\n` +
        `**NJOPTKP** (Nilai Jual Objek Tidak Kena Pajak) = Rp 12.000.000 per WP.\n\n` +
        `*Rumus:*\n` +
        `PBB = 0,3% × (NJOP − NJOPTKP)\n\n` +
        `*Contoh:*\n` +
        `NJOP Rp 200.000.000\n` +
        `PBB = 0,3% × (200.000.000 − 12.000.000)\n` +
        `PBB = Rp 564.000 per tahun\n\n` +
        `Gunakan fitur **Simulasi Pajak** di dashboard untuk kalkulasi otomatis.`,
      suggestions: ["Cek tagihan saya", "Cara bayar pajak", "Info denda"],
    };
  }

  // Denda / sanksi
  if (/denda|sanksi|telat\s*bayar|terlambat|keterlambatan/i.test(query)) {
    return {
      message:
        `⚠️ *Denda Keterlambatan PBB*\n\n` +
        `Apabila pembayaran melewati jatuh tempo, dikenakan:\n\n` +
        `• Denda *2% per bulan* dari pokok pajak terutang\n` +
        `• Denda dihitung sejak jatuh tempo hingga tanggal bayar\n` +
        `• Maksimal denda *24%* (12 bulan)\n\n` +
        `💡 *Saran:* Segera lunasi tagihan sebelum jatuh tempo untuk menghindari denda.`,
      suggestions: ["Cek tagihan saya", "Cara bayar pajak", "Cicil pajak"],
    };
  }

  // NPWPD
  if (/npwpd/i.test(query)) {
    return {
      message:
        `📋 *NPWPD (Nomor Pokok Wajib Pajak Daerah)*\n\n` +
        `NPWPD adalah nomor identitas untuk wajib pajak daerah, khusus untuk:\n\n` +
        `• 🏨 Pajak Hotel (10%)\n` +
        `• 🍽️ Pajak Restoran (10%)\n` +
        `• 🎭 Pajak Hiburan (10−35%)\n` +
        `• 🚗 Pajak Parkir (20%)\n` +
        `• 📢 Pajak Reklame (25%)\n` +
        `• 💧 Pajak Air Tanah (20%)\n\n` +
        `Daftar NPWPD melalui **portal SIPADA** atau datang langsung ke kantor Bapenda Medan.`,
      suggestions: ["Info pajak daerah", "Alamat kantor", "Cara daftar akun"],
    };
  }

  // Pajak daerah (hotel, restoran, dll)
  if (/pajak\s*(hotel|restoran|hiburan|parkir|reklame|daerah|air\s*tanah)/i.test(query)) {
    return {
      message:
        `🏛️ *Jenis Pajak Daerah Kota Medan*\n\n` +
        `Berikut pajak daerah yang dikelola Bapenda Medan:\n\n` +
        `1. *Pajak Hotel* — 10% dari tarif kamar\n` +
        `2. *Pajak Restoran* — 10% dari pembayaran\n` +
        `3. *Pajak Hiburan* — 10−35% (tergantung jenis)\n` +
        `4. *Pajak Parkir* — 20% dari tarif parkir\n` +
        `5. *Pajak Reklame* — 25% dari nilai sewa\n` +
        `6. *Pajak Air Tanah* — 20% dari nilai perolehan\n` +
        `7. *PBB-P2* — 0,3% dari NJOP kena pajak\n\n` +
        `Untuk info lebih lanjut, kunjungi portal SIPADA atau kantor Bapenda Medan.`,
      suggestions: ["Info tarif PBB", "NPWPD", "Alamat kantor"],
    };
  }

  // Keberatan
  if (/keberatan|banding|gugatan|sanggah/i.test(query)) {
    if (!userId) {
      return {
        message: "Untuk mengajukan keberatan pajak, Anda harus masuk ke akun terlebih dahulu.\n\nSilakan login ke portal SIPADA, lalu buka menu **Pengajuan** dan pilih jenis **Keberatan**.",
        suggestions: ["Cara login", "Buat akun baru", "Hubungi petugas"],
      };
    }
    return {
      message:
        `📑 *Cara Mengajukan Keberatan Pajak*\n\n` +
        `Jika Anda tidak setuju dengan penetapan PBB atau pajak lainnya:\n\n` +
        `1. Login ke portal SIPADA\n` +
        `2. Buka menu **Pengajuan** > **Keberatan**\n` +
        `3. Isi formulir dan unggah dokumen pendukung\n` +
        `4. Petugas akan memproses dalam *14 hari kerja*\n\n` +
        `Atau datang langsung ke kantor Bapenda Medan dengan membawa dokumen asli.`,
      suggestions: ["Cek status pengajuan", "Alamat kantor", "Hubungi petugas"],
    };
  }

  // Cara bayar pajak
  if (/cara\s*(bayar|membayar)|pembayaran|metode\s*bayar/i.test(query)) {
    if (!userId) {
      return {
        message:
          `💳 *Cara Pembayaran Pajak*\n\n` +
          `Pembayaran pajak dapat dilakukan melalui:\n\n` +
          `• **ATM / Mobile Banking** (Mandiri, BNI, BRI)\n` +
          `• **E-Wallet** (GoPay, OVO, Dana, LinkAja)\n` +
          `• **QRIS** (scan di kantor Bapenda)\n` +
          `• **Langsung** ke kasir Bapenda Medan\n\n` +
          `Untuk melihat tagihan dan membayar, silakan **login** ke portal SIPADA terlebih dahulu.`,
        suggestions: ["Login sekarang", "Cek tagihan saya", "Alamat kantor"],
      };
    }
    return {
      message:
        `💳 *Cara Pembayaran Pajak Online*\n\n` +
        `1. Login ke portal SIPADA\n` +
        `2. Buka menu **SPPT Saya** atau **Riwayat Pembayaran**\n` +
        `3. Klik **Bayar Pajak** pada tagihan aktif\n` +
        `4. Pilih metode pembayaran:\n` +
        `   • Virtual Account (Mandiri / BNI / BRI)\n` +
        `   • E-Wallet (GoPay, OVO, Dana)\n` +
        `   • QRIS\n` +
        `5. Selesaikan pembayaran — status akan otomatis terupdate`,
      suggestions: ["Cek tagihan saya", "Riwayat pembayaran", "Lihat SPPT"],
    };
  }

  // Cara lihat SPPT / unduh SPPT
  if (/(cara|bagaimana)\s*(lihat|unduh|download|mendapatkan)\s*sppt|sppt\s*digital/i.test(query)) {
    return {
      message:
        `📄 *Cara Melihat & Mengunduh SPPT Digital*\n\n` +
        `1. Login ke portal SIPADA\n` +
        `2. Buka menu **SPPT Saya** di dashboard\n` +
        `3. Pilih tahun pajak yang diinginkan\n` +
        `4. Klik **Unduh** untuk mendapatkan salinan resmi SPPT\n\n` +
        `Dokumen SPPT digital tersedia dalam format PDF dan dapat digunakan untuk keperluan administrasi.`,
      suggestions: ["Cek tagihan saya", "Cara bayar pajak", "Cara cek NOP"],
    };
  }

  // Login
  if (/cara\s*login|(bagaimana|gimana)\s*masuk|login\s*portal/i.test(query)) {
    return {
      message:
        `🔐 *Cara Login ke Portal SIPADA*\n\n` +
        `1. Buka halaman utama SIPADA\n` +
        `2. Klik tombol **Masuk Portal** di pojok kanan atas\n` +
        `3. Masukkan **Email** dan **Password** Anda\n` +
        `4. Klik **Masuk**\n\n` +
        `Belum punya akun? Klik **Daftar Baru** di halaman login.`,
      suggestions: ["Buat akun baru", "Lupa password", "Cek tagihan saya"],
    };
  }

  // Buat akun / registrasi
  if (/daftar|registrasi|buat\s*akun|akun\s*baru/i.test(query)) {
    return {
      message:
        `📝 *Cara Membuat Akun SIPADA*\n\n` +
        `1. Klik **Masuk Portal** di pojok kanan atas\n` +
        `2. Pilih **Daftar Baru**\n` +
        `3. Isi data yang diperlukan:\n` +
        `   • NIK (KTP)\n` +
        `   • Email aktif\n` +
        `   • Nomor HP\n` +
        `   • Password\n` +
        `4. Klik **Daftar**\n` +
        `5. Verifikasi email Anda\n\n` +
        `Setelah terdaftar, Anda bisa langsung login dan mengakses layanan.`,
      suggestions: ["Cara login", "Cek tagihan saya", "Hubungi petugas"],
    };
  }

  // Lupa password
  if (/lupa\s*(password|pass|kata\s*sandi)|reset\s*password|ganti\s*password/i.test(query)) {
    return {
      message:
        `🔑 *Lupa Password?*\n\n` +
        `Saat ini, reset password dapat dilakukan dengan menghubungi:\n\n` +
        `• **Customer Service** Bapenda Medan: (061) 451-6789\n` +
        `• **Email**: bapenda@pemkomedan.go.id\n` +
        `• Datang langsung ke kantor Bapenda Medan\n\n` +
        `Admin akan memverifikasi identitas Anda dan membantu mereset password.`,
      suggestions: ["Cara login", "Buat akun baru", "Alamat kantor"],
    };
  }

  // Cara pakai dashboard
  if (/dashboard|menu|fitur|panduan\s*sistem|cara\s*pakai/i.test(query)) {
    return {
      message:
        `🖥️ *Panduan Dashboard SIPADA*\n\n` +
        `Setelah login, Anda akan melihat dashboard dengan menu:\n\n` +
        `• **SPPT Saya** — Lihat & unduh SPPT digital\n` +
        `• **Riwayat Pembayaran** — Cek histori bayar\n` +
        `• **Pengajuan** — Ajukan & pantau permohonan\n` +
        `• **Pengaduan** — Laporkan kendala\n` +
        `• **Profil** — Edit data diri\n` +
        `• **Notifikasi** — Info terbaru dari sistem\n\n` +
        `Gunakan menu navigasi di samping kiri untuk berpindah halaman.`,
      suggestions: ["Cek tagihan saya", "Cara bayar pajak", "Cara buat pengajuan"],
    };
  }

  // PPID
  if (/ppid|informasi\s*publik/i.test(query)) {
    return {
      message:
        `📋 *Layanan PPID (Informasi Publik)*\n\n` +
        `PPID melayani permohonan dokumen atau informasi publik secara resmi.\n\n` +
        `*Cara mengajukan:*\n` +
        `1. Login ke portal SIPADA\n` +
        `2. Buka menu **Informasi Publik** / **PPID**\n` +
        `3. Klik **Buat Permohonan Baru**\n` +
        `4. Isi form dan unggah KTP\n` +
        `5. Proses 1−10 hari kerja`,
      suggestions: ["Cara login", "Alamat kantor", "Hubungi petugas"],
    };
  }

  // NOP
  if (/nop|nomor\s*objek\s*pajak|cari\s*nop/i.test(query)) {
    return {
      message:
        `🔢 *Nomor Objek Pajak (NOP)*\n\n` +
        `NOP adalah nomor unik 18 digit yang tertera pada SPPT fisik Anda.\n\n` +
        `Gunakan NOP untuk:\n` +
        `• Cek tagihan pajak secara cepat\n` +
        `• Cek status pembayaran\n` +
        `• Mengajukan keberatan\n\n` +
        `Cek tagihan dengan NOP melalui widget **Cek Pajak Cepat** di halaman utama SIPADA.`,
      suggestions: ["Cek tagihan saya", "Cara lihat SPPT", "Hubungi petugas"],
    };
  }

  // Alamat & kontak
  if (/alamat|lokasi|kantor|jam\s*(operasional|kerja)|kontak|telepon|call\s*center|cs/i.test(query)) {
    return {
      message:
        `📍 *Kantor Bapenda Kota Medan*\n\n` +
        `**Alamat:**\n` +
        `Jl. Kapten Maulana Lubis No. 2, Petisah Tengah\n` +
        `Medan Petisah, Kota Medan 20112\n\n` +
        `**Jam Operasional:**\n` +
        `Senin−Jumat, 08.00 − 16.30 WIB\n\n` +
        `**Kontak:**\n` +
        `📞 (061) 451-6789\n` +
        `📧 bapenda@pemkomedan.go.id\n` +
        `🌐 https://bapenda.medan.go.id`,
      suggestions: ["Jam operasional", "Website & medsos", "Cara bayar pajak"],
    };
  }

  // Website & medsos
  if (/website|sosial\s*media|instagram|facebook|youtube|twitter|medsos/i.test(query)) {
    return {
      message:
        `🌐 *Kanal Resmi Bapenda Medan*\n\n` +
        `🌐 Website: https://bapenda.medan.go.id\n` +
        `📷 Instagram: @bapendakotamedan\n` +
        `👍 Facebook: Bapenda Kota Medan\n` +
        `📺 YouTube: Bapenda Kota Medan\n` +
        `🐦 Twitter/X: @bapendamedan\n\n` +
        `📱 Portal SIPADA: https://sipada.medan.go.id\n\n` +
        `Ikuti dan follow untuk info terbaru seputar pajak daerah!`,
      suggestions: ["Alamat kantor", "Berita terbaru", "Info tarif pajak"],
    };
  }

  // Apa itu PBB
  if (/apa\s*itu\s*pbb|pengertian\s*pbb|pbb\s*adalah/i.test(query)) {
    return {
      message:
        `🏠 *Apa Itu PBB?*\n\n` +
        `**PBB** (Pajak Bumi dan Bangunan) adalah pajak yang dikenakan atas kepemilikan tanah dan/atau bangunan.\n\n` +
        `PBB-P2 (Pajak Bumi dan Bangunan Perdesaan dan Perkotaan) dikelola oleh **Pemerintah Kota Medan** melalui Bapenda.\n\n` +
        `*Ciri-ciri PBB:*\n` +
        `• Dibayar setiap 1 tahun sekali\n` +
        `• Dasar pengenaan: NJOP (Nilai Jual Objek Pajak)\n` +
        `• Tarif: 0,3% dari NJOP kena pajak\n` +
        `• Hasilnya untuk pembangunan daerah`,
      suggestions: ["Tarif & perhitungan PBB", "Cek tagihan saya", "Cara bayar pajak"],
    };
  }

  // Pengajuan / permohonan (informasi umum)
  if (/pengajuan|permohonan|layanan/i.test(query) && !/saya|status/.test(query)) {
    return {
      message:
        `📑 *Layanan Pengajuan*\n\n` +
        `Anda dapat mengajukan berbagai permohonan melalui portal SIPADA:\n\n` +
        `• **Perubahan Data** — Ubah data objek pajak\n` +
        `• **Keberatan** — Ajukan keberatan atas penetapan pajak\n` +
        `• **Permohonan Informasi** — Minta data/dokumen publik\n\n` +
        `Silakan login untuk melihat status pengajuan Anda atau buat pengajuan baru.`,
      suggestions: ["Cek status pengajuan", "Cara login", "Buat pengajuan baru"],
    };
  }

  // Pengaduan (informasi umum)
  if (/pengaduan|aduan|keluhan|laporan/i.test(query) && !/saya|status/.test(query)) {
    return {
      message:
        `📬 *Layanan Pengaduan*\n\n` +
        `Jika Anda mengalami kendala atau ketidaksesuaian, silakan laporkan melalui:\n\n` +
        `1. Login ke portal SIPADA\n` +
        `2. Buka menu **Pengaduan**\n` +
        `3. Pilih kategori (Pelayanan, Teknis Sistem, Pajak, dll)\n` +
        `4. Isi keluhan Anda\n` +
        `5. Petugas akan menindaklanjuti\n\n` +
        `Atau datang langsung ke kantor Bapenda Medan.`,
      suggestions: ["Cek status pengaduan", "Alamat kantor", "Hubungi petugas"],
    };
  }

  // Sapaan / greeting
  if (/^(halo|hai|siang|pagi|sore|malam|selamat|test|tes|bot|hey|hi)\b/i.test(query)) {
    return {
      message:
        `Halo! 👋 Saya **Asisten Pajak BAPENDA Medan**.\n\n` +
        `Saya siap membantu Anda seputar:\n\n` +
        (role === "DEVELOPER"
          ? `• 📊 Statistik & monitoring sistem\n• 📋 Audit log\n• 👥 Data pengguna\n\n` +
            `Ketik pertanyaan Anda atau pilih menu di bawah.`
          : role === "ADMIN"
          ? `• 📊 Ringkasan data pajak\n• 📑 Pengajuan pending\n• 💰 Rekap pembayaran\n• 👥 Data wajib pajak\n\n` +
            `Ketik pertanyaan Anda atau pilih menu di bawah.`
          : role === "OFFICER"
          ? `• 🏠 Data objek pajak\n• 📋 Penilaian & survey\n• ✅ Verifikasi\n\n` +
            `Ketik pertanyaan Anda atau pilih menu di bawah.`
          : `• 💳 Cek tagihan & bayar pajak\n• 📄 Lihat & unduh SPPT\n• 📑 Status pengajuan\n• 📬 Buat pengaduan\n• 🧾 Riwayat pembayaran\n• ℹ️ Informasi & panduan\n\n` +
            `Ketik pertanyaan Anda atau pilih menu di bawah.`),
      suggestions: role === "DEVELOPER"
        ? ["Statistik sistem", "Audit log", "Data pengguna"]
        : role === "ADMIN"
        ? ["Ringkasan data", "Pengajuan pending", "Rekap pembayaran"]
        : role === "OFFICER"
        ? ["Data objek pajak", "Aktivitas saya", "Mulai penilaian"]
        : userId
        ? ["Cek tagihan saya", "Lihat SPPT", "Riwayat pembayaran", "Status pengajuan"]
        : ["Cek tagihan saya", "Cara login", "Cara bayar pajak", "Alamat kantor"],
    };
  }

  // ─── Fallback ────────────────────────────────────────────────────────────
  return fallbackReply(
    userId
      ? ["Cek tagihan saya", "Lihat SPPT", "Riwayat pembayaran", "Status pengajuan"]
      : ["Cara login", "Buat akun baru", "Cek tagihan", "Alamat kantor"]
  );
}

// ─── Route handlers ────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[CHATBOT_GET]", error);
    return NextResponse.json({ success: false, error: "Gagal memuat percakapan." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const role = session?.user?.role || null;

    const body = await req.json();
    const rawMessage = body?.message;

    // ── Input validation ───────────────────────────────────────────────────
    if (!rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json({ success: false, error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const safeMessage = santizeInput(rawMessage);

    if (safeMessage.length < 2) {
      return NextResponse.json({ success: false, error: "Pesan terlalu pendek. Silakan ketik pertanyaan yang lebih jelas." }, { status: 400 });
    }

    // ── Spam / abuse detection ─────────────────────────────────────────────
    if (isSpam(safeMessage)) {
      const warning = await prisma.chatMessage.create({
        data: {
          userId,
          role,
          message: "Pesan mengandung pola yang tidak diizinkan. Silakan ajukan pertanyaan yang sesuai.",
          sender: "BOT",
        },
      });
      await prisma.chatMessage.create({
        data: { userId, role, message: safeMessage, sender: "USER" },
      });
      return NextResponse.json({ success: true, reply: warning });
    }

    // ── Rate limiting ──────────────────────────────────────────────────────
    const recentCount = await prisma.chatMessage.count({
      where: {
        userId,
        sender: "USER",
        createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW) },
      },
    });

    if (recentCount >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({
        success: false,
        error: "Anda terlalu banyak mengirim pesan. Silakan tunggu beberapa saat.",
      }, { status: 429 });
    }

    // ── Save user message ──────────────────────────────────────────────────
    await prisma.chatMessage.create({
      data: { userId, role, message: safeMessage, sender: "USER" },
    });

    // ── Generate reply ─────────────────────────────────────────────────────
    const sessionUser: SessionUser | null = session?.user
      ? { id: session.user.id as string, role: session.user.role as string, name: session.user.name, email: session.user.email }
      : null;

    const reply = await getReply(safeMessage, sessionUser);

    // ── Save bot reply ─────────────────────────────────────────────────────
    const botMsg = await prisma.chatMessage.create({
      data: { userId, role, message: reply.message, sender: "BOT" },
    });

    return NextResponse.json({
      success: true,
      reply: { ...botMsg, suggestions: reply.suggestions },
    });
  } catch (error) {
    console.error("[CHATBOT_POST]", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan sistem. Silakan coba lagi." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    if (userId) {
      await prisma.chatMessage.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ success: true, message: "Percakapan berhasil dihapus." });
  } catch (error) {
    console.error("[CHATBOT_DELETE]", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus percakapan." }, { status: 500 });
  }
}
