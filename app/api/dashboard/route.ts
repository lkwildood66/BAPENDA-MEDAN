import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;

    if (role === "ADMIN" || role === "DEVELOPER") {
      // Admin sees all stats
      const [userCount, pendingCount, paidCount, totalRevenue] = await Promise.all([
        prisma.user.count(),
        prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.payment.count({ where: { status: "PAID" } }),
        prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      ]);

      const recentPayments = await prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          taxObject: { select: { nop: true, type: true, name: true } },
        },
      });

      return NextResponse.json({
        role,
        stats: {
          userCount,
          pendingCount,
          paidCount,
          totalRevenue: Number(totalRevenue._sum.amount ?? 0),
        },
        recentPayments,
      });
    }

    if (role === "OFFICER") {
      const pending = await prisma.payment.findMany({
        where: { status: "PENDING" },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          taxObject: { select: { nop: true, type: true, name: true, address: true } },
        },
      });

      return NextResponse.json({ role, pendingPayments: pending });
    }

    // USER / DEVELOPER (student)
    const userId = session.user.id;
    const [myObjects, myPayments, activeTagihan, spptCount, submissionActiveCount, mySubmissions] = await Promise.all([
      prisma.taxObject.findMany({
        where: { ownerId: userId },
        include: { payments: { take: 3, orderBy: { createdAt: "desc" } } },
      }),
      prisma.payment.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { taxObject: { select: { nop: true, type: true, name: true } } },
      }),
      prisma.payment.findMany({
        where: { userId, status: { in: ["PENDING", "EXPIRED"] } },
        orderBy: { createdAt: "desc" },
        include: { taxObject: { select: { nop: true, type: true, name: true } } },
      }),
      prisma.sppt.count({
        where: { userId },
      }),
      prisma.taxSubmission.count({
        where: { userId, status: { in: ["PENDING", "IN_PROGRESS"] } },
      }),
      prisma.taxSubmission.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ 
      role, 
      taxObjects: myObjects, 
      payments: myPayments,
      activeTagihan,
      spptCount,
      submissionActiveCount,
      submissions: mySubmissions
    });
  } catch (error) {
    console.error("[DASHBOARD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
