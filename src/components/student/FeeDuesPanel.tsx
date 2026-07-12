"use client";

import { useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, IndianRupee, Loader2 } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

export interface FeeDue {
  id: string;
  amount: number;
  feePeriod: string;
  dueDate: string | null;
  notes: string;
}

export interface FeePaymentHistoryItem {
  id: string;
  receiptNumber: string;
  amount: number;
  feePeriod: string;
  gateway: "manual" | "razorpay";
  paidAt: string;
}

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount,
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function FeeDuesPanel({
  dues: initialDues,
  payments,
  totalDue,
  razorpayKeyId,
  studentName,
  studentEmail,
}: {
  dues: FeeDue[];
  payments: FeePaymentHistoryItem[];
  totalDue: number;
  razorpayKeyId: string | null;
  studentName: string;
  studentEmail: string;
}) {
  const [dues, setDues] = useState(initialDues);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justPaidId, setJustPaidId] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const payNow = async (due: FeeDue) => {
    setError(null);

    if (!razorpayKeyId) {
      setError("Online payments aren't set up yet — please pay your institute directly for now.");
      return;
    }

    if (!scriptReady || !window.Razorpay) {
      setError("Payment widget is still loading — try again in a moment.");
      return;
    }

    setPayingId(due.id);

    try {
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueId: due.id }),
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Couldn't start this payment.");
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "TestPulse AI",
        description: due.feePeriod || "Fee payment",
        prefill: { name: studentName, email: studentEmail },
        theme: { color: "#f59e0b" },
        handler: (response) => {
          void (async () => {
            try {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dueId: due.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyResponse.ok) {
                const verifyData = await verifyResponse.json().catch(() => ({}));
                throw new Error(verifyData.error || "Payment verification failed.");
              }

              setDues((current) => current.filter((item) => item.id !== due.id));
              setJustPaidId(due.id);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Payment was received but couldn't be confirmed — contact your institute with your payment ID.",
              );
            } finally {
              setPayingId(null);
            }
          })();
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPayingId(null);
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start this payment.");
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
      >
        <p className="flex items-center gap-2 text-3xl font-bold text-white">
          <IndianRupee className="h-6 w-6 text-amber-400" />
          {formatCurrency(totalDue).replace("₹", "")}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {dues.length > 0 ? `Pending across ${dues.length} due${dues.length === 1 ? "" : "s"}` : "Nothing pending — you're all caught up."}
        </p>
      </motion.div>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!razorpayKeyId && dues.length > 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
          Online payment isn&apos;t configured yet — please pay your institute directly and ask them to
          record it against your account.
        </p>
      )}

      {dues.length > 0 && (
        <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />
          {dues.map((due) => (
            <div
              key={due.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{due.feePeriod || "Fee due"}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {due.dueDate ? `Due ${formatDate(due.dueDate)}` : "No due date set"}
                  {due.notes ? ` · ${due.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-amber-400">{formatCurrency(due.amount)}</p>
                <button
                  type="button"
                  onClick={() => void payNow(due)}
                  disabled={payingId === due.id}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(245,158,11,0.7)] transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingId === due.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {justPaidId && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Payment received — your receipt is in the history below.
        </p>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Payment History</h2>
        <div className="card-glow relative mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />

          {payments.length === 0 && <p className="p-6 text-sm text-slate-500">No payments recorded yet.</p>}

          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{payment.feePeriod || "Fee payment"}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">{payment.receiptNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-slate-700 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  {payment.gateway === "razorpay" ? "Online" : "Manual"}
                </span>
                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-slate-500">{formatDate(payment.paidAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
