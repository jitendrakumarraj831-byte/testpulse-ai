import crypto from "node:crypto";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export const isRazorpayConfigured = Boolean(keyId && keySecret);
export const razorpayPublicKeyId = keyId || null;

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Creates a Razorpay order via the REST Orders API. An order is required
 * before Checkout can open — Razorpay never lets the client hand over an
 * arbitrary amount, so this is the only place a `fee_dues.amount` becomes
 * money that can actually be collected. SERVER-ONLY: uses the secret key.
 */
export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: Math.round(params.amountInRupees * 100),
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay order creation failed: ${detail}`);
  }

  const data = (await response.json()) as { id: string; amount: number; currency: string };
  return { id: data.id, amount: data.amount, currency: data.currency };
}

/**
 * Verifies the signature Razorpay Checkout hands back to the browser after
 * a successful payment: HMAC-SHA256 of `order_id|payment_id` using the
 * secret key. This is what proves the payment_id the client is claiming
 * actually belongs to the order we created, rather than being made up.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, params.signature);
}

/**
 * Verifies a Razorpay webhook's `X-Razorpay-Signature` header: HMAC-SHA256
 * of the raw request body using RAZORPAY_WEBHOOK_SECRET — a separate
 * secret from the API key pair, configured on the webhook in the Razorpay
 * dashboard. Must run against the raw (unparsed) body text.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** `RCPT-YYYYMMDD-XXXXXXXX` using a UUID-derived suffix — safe to call from
 * concurrent server requests (webhook + verify racing each other), unlike
 * the client-side manual-ledger generator which only needs to avoid
 * colliding with itself inside one admin's browser session. */
export function generateReceiptNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RCPT-${datePart}-${randomPart}`;
}
