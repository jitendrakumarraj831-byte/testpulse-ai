"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  Plus,
  Printer,
  Receipt,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

type PaymentMethod = "cash" | "bank_transfer" | "upi" | "cheque" | "other";

interface FeePayment {
  id: string;
  receiptNumber: string;
  payerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  feePeriod: string;
  notes: string;
  paidAt: string;
}

interface FeePaymentRow {
  id: string;
  receipt_number: string;
  payer_name: string;
  amount: number;
  payment_method: PaymentMethod;
  fee_period: string;
  notes: string;
  paid_at: string;
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; payments: FeePayment[] };

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  other: "Other",
};

function rowToPayment(row: FeePaymentRow): FeePayment {
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    payerName: row.payer_name,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    feePeriod: row.fee_period,
    notes: row.notes,
    paidAt: row.paid_at,
  };
}

function generateReceiptNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCPT-${datePart}-${randomPart}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount,
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isSameMonth(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function ReceiptView({ payment }: { payment: FeePayment }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 print:border-slate-300 print:bg-white print:text-black">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 print:text-black">
            TestPulse AI — Fee Receipt
          </p>
          <p className="mt-1 font-mono text-sm text-white print:text-black">{payment.receiptNumber}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 print:hidden"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500 print:text-slate-600">Paid by</p>
          <p className="text-white print:text-black">{payment.payerName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 print:text-slate-600">Date</p>
          <p className="text-white print:text-black">{formatDate(payment.paidAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 print:text-slate-600">Method</p>
          <p className="text-white print:text-black">{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 print:text-slate-600">Period</p>
          <p className="text-white print:text-black">{payment.feePeriod || "—"}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-slate-800 pt-4 print:border-slate-300">
        <p className="text-xs text-slate-500 print:text-slate-600">Amount received</p>
        <p className="text-2xl font-bold text-white print:text-black">{formatCurrency(payment.amount)}</p>
      </div>
      {payment.notes && (
        <p className="mt-3 text-xs text-slate-500 print:text-slate-600">{payment.notes}</p>
      )}
    </div>
  );
}

export function FeeLedgerPanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [feePeriod, setFeePeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const { data, error } = await supabase
      .from("fee_payments")
      .select("id, receipt_number, payer_name, amount, payment_method, fee_period, notes, paid_at")
      .order("paid_at", { ascending: false });

    if (error || !data) {
      setState({ status: "ready", payments: [] });
      return;
    }

    setState({ status: "ready", payments: (data as FeePaymentRow[]).map(rowToPayment) });
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!payerName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Payer name and a positive amount are required.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("fee_payments").insert({
      receipt_number: generateReceiptNumber(),
      payer_name: payerName.trim(),
      amount: parsedAmount,
      payment_method: paymentMethod,
      fee_period: feePeriod.trim(),
      notes: notes.trim(),
    });
    setIsSaving(false);

    if (error) {
      setFormError("Couldn't record this payment. Make sure you're signed in as an admin.");
      return;
    }

    setPayerName("");
    setAmount("");
    setPaymentMethod("cash");
    setFeePeriod("");
    setNotes("");
    void load();
  };

  const payments = state.status === "ready" ? state.payments : [];
  const totalThisMonth = payments
    .filter((payment) => isSameMonth(payment.paidAt))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
            <Receipt className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Fee Ledger</h1>
            <p className="mt-1 text-sm text-slate-500">
              Record payments received and generate receipts. No online payment collection — this is a manual ledger.
            </p>
          </div>
        </div>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so the ledger can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      {state.status === "ready" && (
        <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <p className="flex items-center gap-2 text-3xl font-bold text-white">
            <IndianRupee className="h-6 w-6 text-amber-400" />
            {formatCurrency(totalThisMonth).replace("₹", "")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Collected this month · {payments.filter((payment) => isSameMonth(payment.paidAt)).length} receipts
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card-glow relative space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
      >
        <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fee-payer" className="text-sm font-medium text-slate-300">Payer name</label>
            <input
              id="fee-payer"
              type="text"
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              placeholder="e.g. Priya Sharma"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label htmlFor="fee-amount" className="text-sm font-medium text-slate-300">Amount</label>
            <input
              id="fee-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 5000"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label htmlFor="fee-method" className="text-sm font-medium text-slate-300">Method</label>
            <select
              id="fee-method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            >
              {(Object.entries(PAYMENT_METHOD_LABEL) as [PaymentMethod, string][]).map(([value, label]) => (
                <option key={value} value={value} className="bg-slate-900">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fee-period" className="text-sm font-medium text-slate-300">
              Fee period <span className="text-slate-600">(optional)</span>
            </label>
            <input
              id="fee-period"
              type="text"
              value={feePeriod}
              onChange={(event) => setFeePeriod(event.target.value)}
              placeholder="e.g. Term 1, 2026"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fee-notes" className="text-sm font-medium text-slate-300">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              id="fee-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {formError && (
          <p className="flex items-center gap-2 text-sm text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !supabase}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(245,158,11,0.7)] transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Record Payment
        </button>
      </form>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />

        {state.status === "loading" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "ready" && payments.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No payments recorded yet.</p>
        )}

        {state.status === "ready" &&
          payments.map((payment) => (
            <div key={payment.id} className="border-b border-slate-800/60 last:border-0">
              <button
                type="button"
                onClick={() => setExpandedId((current) => (current === payment.id ? null : payment.id))}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{payment.payerName}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{payment.receiptNumber}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-slate-500">{formatDate(payment.paidAt)}</p>
                </div>
              </button>
              {expandedId === payment.id && (
                <div className="px-6 pb-5">
                  <ReceiptView payment={payment} />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
