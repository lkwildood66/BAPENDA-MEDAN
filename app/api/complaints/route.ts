import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { AuditService } from "@/lib/services/audit";
import { NotificationService } from "@/lib/services/notification";

function genTicket() {
  const y = new Date().getFullYear();
  return `ADU-${y}${Math.floor(Math.random() * 90000) + 10000}`;
}

const Schema = z.object({
  subject: z.string().min(5, "Subjek minimal 5 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category: z.enum(["PELAYANAN", "TEKNIS_SISTEM", "PAJAK", "PETUGAS", "LAINNYA"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  isAnonymous: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = ["ADMIN", "DEVELOPER", "OFFICER"].includes(session.user.role);

    const complaints = await prisma.complaint.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("[COMPLAINT_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        ...parsed.data,
        ticketNumber: genTicket(),
        userId: session.user.id,
      },
    });

    await AuditService.log({
      userId: session.user.id,
      action: "CREATE_COMPLAINT",
      table: "Complaint",
      recordId: complaint.id,
      newValue: { ticketNumber: complaint.ticketNumber, subject: complaint.subject },
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OFFICER"] } }, select: { id: true } });
    for (const admin of admins) {
      await NotificationService.notify({
        userId: admin.id,
        title: "Pengaduan Baru",
        message: `Pengaduan "${complaint.subject}" (${complaint.ticketNumber}) telah masuk dengan prioritas ${complaint.priority}.`,
        type: "WARNING",
        category: "DASHBOARD",
      });
    }

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error("[COMPLAINT_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
