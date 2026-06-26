import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { AuditService } from "@/lib/services/audit";
import { NotificationService } from "@/lib/services/notification";

function genRequestNumber() {
  const y = new Date().getFullYear();
  return `RES-${y}${Math.floor(Math.random() * 90000) + 10000}`;
}

const Schema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  institution: z.string().min(3, "Nama institusi wajib diisi"),
  supervisorName: z.string().min(3, "Nama pembimbing wajib diisi"),
  supervisorNip: z.string().optional(),
  dataNeeded: z.string().min(10, "Data yang dibutuhkan wajib diisi"),
  purpose: z.string().min(10, "Tujuan penelitian wajib diisi"),
  documentUrl: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Admin/Officer see all, others see only their own
    const isAdmin = ["ADMIN", "DEVELOPER", "OFFICER"].includes(session.user.role);

    const requests = await prisma.researchRequest.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: { user: { select: { name: true, email: true, institution: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[RESEARCH_GET]", error);
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

    const request = await prisma.researchRequest.create({
      data: {
        ...parsed.data,
        requestNumber: genRequestNumber(),
        userId: session.user.id,
      },
    });

    await AuditService.log({
      userId: session.user.id,
      action: "CREATE_RESEARCH_REQUEST",
      table: "ResearchRequest",
      recordId: request.id,
      newValue: { requestNumber: request.requestNumber, title: request.title },
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OFFICER"] } }, select: { id: true } });
    for (const admin of admins) {
      await NotificationService.notify({
        userId: admin.id,
        title: "Riset Mahasiswa Baru",
        message: `Permohonan riset "${request.title}" (${request.requestNumber}) telah diajukan oleh ${session.user.name || session.user.email}.`,
        type: "INFO",
        category: "DASHBOARD",
      });
    }

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error("[RESEARCH_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
