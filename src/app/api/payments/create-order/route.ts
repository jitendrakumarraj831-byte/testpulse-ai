import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createRazorpayOrder, isRazorpayConfigured, razorpayPublicKeyId } from "@/lib/payments/razorpay";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  dueId: string;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dueId = (body as { dueId?: unknown })?.dueId;
  if (typeof dueId !== "string" || !dueId) {
    return NextResponse.json({ error: "A 'dueId' is required." }, { status: 400 });
  }

  if (!isRazorpayConfigured || !razorpayPublicKeyId) {
    return NextResponse.json(
      { error: "Online payments aren't configured yet. Please pay your institute directly." },
      { status: 501 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // RLS on fee_dues scopes this select to the caller's own dues, but the
  // student_id check below is kept as an explicit, readable guard rather
  // than relying on RLS silently returning null for someone else's due.
  const { data: due, error } = await supabase
    .from("fee_dues")
    .select("id, student_id, amount, fee_period, status")
    .eq("id", dueId)
    .maybeSingle();

  if (error || !due) {
    return NextResponse.json({ error: "This fee due wasn't found." }, { status: 404 });
  }

  if (due.student_id !== user.id) {
    return NextResponse.json({ error: "This fee due doesn't belong to you." }, { status: 403 });
  }

  if (due.status !== "pending") {
    return NextResponse.json({ error: "This fee due has already been settled." }, { status: 409 });
  }

  try {
    const order = await createRazorpayOrder({
      amountInRupees: Number(due.amount),
      receipt: `due-${due.id}`,
      notes: { due_id: due.id, student_id: user.id },
    });

    const payload: CreateOrderResponse = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayPublicKeyId,
      dueId: due.id,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[payments/create-order] Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }
}
