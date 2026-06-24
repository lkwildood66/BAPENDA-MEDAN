import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: userId,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[CHATBOT_GET_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const role = session?.user?.role || null;

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    // 1. Simpan pesan dari User ke database
    await prisma.chatMessage.create({
      data: {
        userId,
        role,
        message,
        sender: "USER",
      },
    });

    // 2. Logika asisten pintar pajak daerah
    const query = message.toLowerCase();
    let reply = "";

    // ─── A. LOGIKA UTAMA: RETRIEVAL DATA INTERNAL SEPAHAMAN ROLE-BASED ACCESS ───
    if (query.includes("tagihan saya") || query.includes("lihat tagihan") || query.includes("cek tagihan")) {
      if (!session || !userId) {
        reply = "Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar tagihan aktif Anda.";
      } else {
        const pendingPayments = await prisma.payment.findMany({
          where: { userId: userId as string, status: "PENDING" },
          include: { taxObject: true },
          take: 5,
        });

        if (pendingPayments.length === 0) {
          reply = "Hebat! Anda tidak memiliki tagihan aktif yang belum dibayar saat ini.";
        } else {
          reply = `Berikut daftar tagihan Anda yang belum lunas:\n` + 
            pendingPayments.map(p => `- *${(p as any).taxObject?.name || "Objek Pajak"}* (NOP: ${(p as any).taxObject?.nop || "Tidak ada"})\n  Tunggakan: Rp ${Number(p.amount).toLocaleString("id-ID")}\n  Jatuh Tempo: ${new Date(p.expiredAt).toLocaleDateString("id-ID")}`).join("\n\n") +
            `\n\nAnda dapat membayarnya langsung melalui menu "Riwayat Pembayaran" di dashboard Anda.`;
        }
      }
    } else if (query.includes("sppt saya") || query.includes("sppt") || query.includes("unduh sppt")) {
      if (!session || !userId) {
        reply = "Untuk melihat dan mengunduh berkas SPPT digital Anda, silakan masuk ke portal terlebih dahulu.";
      } else {
        const sppts = await prisma.sppt.findMany({
          where: { userId: userId as string },
          include: { taxObject: true },
          take: 5,
        });

        if (sppts.length === 0) {
          reply = "Sistem belum mendeteksi adanya dokumen SPPT digital atas nama akun Anda. Pastikan NOP Anda telah terdaftar.";
        } else {
          reply = `Berikut daftar dokumen SPPT Anda:\n` +
            sppts.map(s => `- *${(s as any).taxObject?.name || "Objek Pajak"}* (NOP: ${(s as any).taxObject?.nop || "Tidak ada"})\n  Tahun Pajak: ${s.taxPeriod}\n  Ketetapan Pajak: Rp ${Number(s.taxObjectVal).toLocaleString("id-ID")}`).join("\n\n") +
            `\n\nAnda dapat mengunduh salinan resmi SPPT digital dari menu "SPPT Saya" di dashboard.`;
        }
      }
    } else if (query.includes("status pengajuan") || query.includes("cek pengajuan") || query.includes("pengajuan saya")) {
      if (!session || !userId) {
        reply = "Silakan masuk ke portal terlebih dahulu untuk memantau status dokumen pengajuan Anda.";
      } else {
        const submissions = await prisma.taxSubmission.findMany({
          where: { userId: userId as string },
          take: 5,
          orderBy: { createdAt: "desc" },
        });

        if (submissions.length === 0) {
          reply = "Anda belum memiliki riwayat pengajuan permohonan atau pelayanan pajak daerah.";
        } else {
          reply = `Berikut status pengajuan terbaru Anda:\n` +
            submissions.map(s => `- *${s.title}* (No: ${s.ticketNumber})\n  Jenis: ${s.type}\n  Status: ${s.status === "PENDING" ? "Menunggu Verifikasi" : s.status === "IN_PROGRESS" ? "Diproses" : s.status}`).join("\n\n");
        }
      }
    } else if (role === "ADMIN" && (query.includes("total wp") || query.includes("jumlah wp") || query.includes("statistik wp"))) {
      const wpCount = await prisma.user.count({ where: { role: "USER" } });
      const activeWp = await prisma.user.count({ where: { role: "USER", isActive: true } });
      reply = `Halo Admin! Saat ini terdapat total *${wpCount}* Wajib Pajak terdaftar di dalam sistem, dengan *${activeWp}* pengguna aktif.`;
    } 
    // ─── B. LOGIKA DUKUNGAN: INFORMASI UMUM PERPAJAKAN ───
    else if (query.includes("bayar pajak") || query.includes("cara bayar") || query.includes("pembayaran")) {
      reply = "Pembayaran pajak daerah di Kota Medan dapat dilakukan secara online melalui portal SIPADA dengan cara:\n" +
        "1. Masuk ke portal wajib pajak.\n" +
        "2. Masuk ke menu 'SPPT Saya' atau 'Riwayat Pembayaran'.\n" +
        "3. Klik tombol 'Bayar Pajak' pada tagihan aktif.\n" +
        "4. Pilih metode pembayaran (Virtual Account Mandiri/BNI/BRI/e-Wallet/QRIS).\n" +
        "5. Transfer sesuai tagihan untuk pelunasan instan.";
    } else if (query.includes("ppid") || query.includes("informasi publik")) {
      reply = "Layanan PPID (Pejabat Pengelola Informasi dan Dokumentasi) digunakan untuk permohonan dokumen/informasi publik secara resmi. Caranya:\n" +
        "1. Masuk ke portal SIPADA.\n" +
        "2. Buka menu 'Informasi Publik' atau 'PPID'.\n" +
        "3. Klik 'Buat Permohonan Baru' dan isi form serta unggah file pendukung (seperti KTP).\n" +
        "4. Petugas akan memproses permohonan Anda dalam 1-10 hari kerja.";
    } else if (query.includes("pengaduan") || query.includes("aduan")) {
      reply = "Jika Anda mengalami kendala pelayanan atau ketidaksesuaian data, Anda dapat menyalurkan aspirasi melalui menu 'Pengaduan' di dashboard akun Anda. Petugas kami akan segera menanggapi laporan Anda secara langsung.";
    } else if (query.includes("registrasi") || query.includes("daftar akun") || query.includes("buat akun")) {
      reply = "Untuk membuat akun SIPADA baru, klik tombol 'Masuk Portal' di sudut kanan atas halaman utama, lalu pilih 'Daftar Baru'. Siapkan NIK, Email, nomor HP aktif, dan password Anda.";
    } else if (query.includes("nop") || query.includes("cari nop") || query.includes("nomor objek")) {
      reply = "Nomor Objek Pajak (NOP) terdiri dari 18 digit unik yang tertera pada SPPT fisik Anda. Anda juga dapat memeriksa tagihan NOP secara cepat di halaman utama SIPADA melalui widget 'Cek Pajak Cepat'.";
    } else if (query.includes("reset password") || query.includes("lupa password")) {
      reply = "Jika Anda lupa password, Anda dapat menghubungi Customer Service Bapenda Medan atau admin verifikasi data kami melalui menu kontak bantuan untuk reset password.";
    } else {
      reply = "Halo! Saya adalah Asisten Pajak Daerah Kota Medan. Saya dapat membantu Anda tentang:\n" +
        "- Informasi tagihan Anda (*ketik: 'lihat tagihan saya'*)\n" +
        "- Status SPPT digital Anda (*ketik: 'unduh sppt saya'*)\n" +
        "- Memantau berkas permohonan (*ketik: 'status pengajuan'*)\n" +
        "- Panduan pembayaran online, PPID, pengaduan, dan pendaftaran akun.\n\n" +
        "Silakan ketikkan pertanyaan Anda.";
    }

    // 3. Simpan balasan Bot ke database
    const botMsg = await prisma.chatMessage.create({
      data: {
        userId,
        role: "BOT",
        message: reply,
        sender: "BOT",
      },
    });

    return NextResponse.json({ success: true, reply: botMsg });
  } catch (error) {
    console.error("[CHATBOT_POST_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Reset percakapan dengan menghapus semua riwayat pesan user
    await prisma.chatMessage.deleteMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ success: true, message: "Percakapan berhasil direset." });
  } catch (error) {
    console.error("[CHATBOT_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
