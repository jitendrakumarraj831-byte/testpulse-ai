import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { generateReceiptNumber, verifyWebhookSignature } from "@/lib/payments/razorpay";

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  notes?: { due_id?: string; student_id?: string };
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: { payment?: { entity?: RazorpayPaymentEntity } };
}

/**
 * Server-to-server Razorpay webhook — the authoritative record of a
 * captured payment, independent of whether the student's browser stayed
 * open long enough for the client-side /api/payments/verify call to
 * complete. Not covered by src/middleware.ts's session-based auth (there is
 * no user session on a webhook call), so the signature check below is the
 * entire security boundary for this route.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Ack (200) anything we don't act on so Razorpay stops retrying it.
  if (payload.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const payment = payload.payload?.payment?.entity;
  const dueId = payment?.notes?.due_id;

  if (!payment || !dueId) {
    return NextResponse.json({ received: true });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("[payments/webhook] SUPABASE_SERVICE_ROLE_KEY not configured — dropping event.");
    return NextResponse.json({ received: true });
  }

  const { data: existing } = await supabaseAdmin
    .from("fee_payments")
    .select("id")
    .eq("gateway_payment_id", payment.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true });
  }

  const { data: due } = await supabaseAdmin
    .from("fee_dues")
    .select("id, student_id, amount, fee_period, status")
    .eq("id", dueId)
    .maybeSingle();

  if (!due || due.status === "paid") {
    return NextResponse.json({ received: true });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", due.student_id)
    .maybeSingle();

  const { error: insertError } = await supabaseAdmin.from("fee_payments").insert({
    receipt_number: generateReceiptNumber(),
    student_id: due.student_id,
    payer_name: profile?.full_name || profile?.email || "Student",
    amount: due.amount,
    payment_method: "upi",
    fee_period: due.fee_period,
    notes: "Paid online via Razorpay",
    due_id: due.id,
    gateway: "razorpay",
    gateway_order_id: payment.order_id,
    gateway_payment_id: payment.id,
  });

  if (insertError) {
    // Still ack 200 — a DB-level failure here isn't something Razorpay
    // retrying can fix, and an admin reconciling dues will notice the
    // missing fee_payments row against a 'pending' due either way.
    console.error("[payments/webhook] Failed to record payment:", insertError);
    return NextResponse.json({ received: true });
  }

  await supabaseAdmin
    .from("fee_dues")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", due.id);

  return NextResponse.json({ received: true });
}
