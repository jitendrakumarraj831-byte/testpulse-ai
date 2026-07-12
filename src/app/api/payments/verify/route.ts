import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { generateReceiptNumber, verifyPaymentSignature } from "@/lib/payments/razorpay";

interface VerifyBody {
  dueId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function isValidBody(value: unknown): value is VerifyBody {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.dueId === "string" &&
    candidate.dueId.length > 0 &&
    typeof candidate.razorpay_order_id === "string" &&
    candidate.razorpay_order_id.length > 0 &&
    typeof candidate.razorpay_payment_id === "string" &&
    candidate.razorpay_payment_id.length > 0 &&
    typeof candidate.razorpay_signature === "string" &&
    candidate.razorpay_signature.length > 0
  );
}

/** Called by the browser immediately after Razorpay Checkout reports
 * success, so the student gets fast feedback without waiting on the
 * webhook. The webhook (route.ts in ../webhook) independently does the
 * same write as the authoritative, server-to-server source of truth — the
 * unique index on fee_payments.gateway_payment_id makes whichever of the
 * two lands second a no-op instead of a duplicate. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: due } = await supabase
    .from("fee_dues")
    .select("id, student_id, amount, fee_period, status")
    .eq("id", body.dueId)
    .maybeSingle();

  if (!due || due.student_id !== user.id) {
    return NextResponse.json({ error: "This fee due doesn't belong to you." }, { status: 403 });
  }

  const signatureValid = verifyPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });

  if (!signatureValid) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  if (due.status === "paid") {
    return NextResponse.json({ success: true, alreadyRecorded: true });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Payment was verified but couldn't be recorded — SUPABASE_SERVICE_ROLE_KEY isn't configured on the server. Contact your institute with your payment ID.",
      },
      { status: 501 },
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("fee_payments")
    .select("id")
    .eq("gateway_payment_id", body.razorpay_payment_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, alreadyRecorded: true });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { error: insertError } = await supabaseAdmin.from("fee_payments").insert({
    receipt_number: generateReceiptNumber(),
    student_id: user.id,
    payer_name: profile?.full_name || profile?.email || "Student",
    amount: due.amount,
    payment_method: "upi",
    fee_period: due.fee_period,
    notes: "Paid online via Razorpay",
    due_id: due.id,
    gateway: "razorpay",
    gateway_order_id: body.razorpay_order_id,
    gateway_payment_id: body.razorpay_payment_id,
    gateway_signature: body.razorpay_signature,
  });

  if (insertError) {
    console.error("[payments/verify] Failed to record payment:", insertError);
    return NextResponse.json(
      { error: "Payment verified but couldn't be recorded. Contact your institute with your payment ID." },
      { status: 500 },
    );
  }

  await supabaseAdmin
    .from("fee_dues")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", due.id);

  return NextResponse.json({ success: true });
}
