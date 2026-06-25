import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PaymentService } from "@/lib/services/payment";

function verifyMidtransSignature(body: Record<string, unknown>): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const orderId = body.order_id as string;
  const statusCode = body.status_code as string;
  const grossAmount = body.gross_amount as string;
  const signatureKey = body.signature_key as string;

  if (!orderId || !statusCode || !grossAmount || !signatureKey) return false;

  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  return hash === signatureKey;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!verifyMidtransSignature(body)) {
      console.warn("[MIDTRANS_WEBHOOK] Invalid signature", { order_id: body.order_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    await PaymentService.handleWebhook(body);

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("[MIDTRANS_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook process failed" }, { status: 500 });
  }
}
