"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Ban, CheckCircle2, IndianRupee, Loader2, Plus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

type ManualPaymentMethod = "cash" | "bank_transfer" | "upi" | "cheque" | "other";
type DueStatus = "pending" | "paid" | "cancelled";

interface StudentOption {
  id: string;
  fullName: string;
}

interface FeeDue {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  feePeriod: string;
  dueDate: string | null;
  notes: string;
  status: DueStatus;
}

interface FeeDueRow {
  id: string;
  student_id: string;
  amount: number;
  fee_period: string;
  due_date: string | null;
  notes: string;
  status: DueStatus;
}

type LoadState = { status: "unconfigured" } | { status: "loading" } | { status: "ready"; dues: FeeDue[] };

const MANUAL_METHOD_LABEL: Record<ManualPaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  other: "Other",
};

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
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function FeeDuesPanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<DueStatus>("pending");

  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [feePeriod, setFeePeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowActionId, setRowActionId] = useState<string | null>(null);
  const [manualMethod, setManualMethod] = useState<Record<string, ManualPaymentMethod>>({});

  const studentNameById = useMemo(
    () => Object.fromEntries(students.map((student) => [student.id, student.fullName])),
    [students],
  );

  const load = async () => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const { data, error } = await supabase
      .from("fee_dues")
      .select("id, student_id, amount, fee_period, due_date, notes, status")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setState({ status: "ready", dues: [] });
      return;
    }

    setState({
      status: "ready",
      dues: (data as FeeDueRow[]).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: studentNameById[row.student_id] || "Unknown student",
        amount: Number(row.amount),
        feePeriod: row.fee_period,
        dueDate: row.due_date,
        notes: row.notes,
        status: row.status,
      })),
    });
  };

  useEffect(() => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      setStudents(
        (data ?? []).map((row) => ({ id: row.id, fullName: row.full_name || row.email })),
      );
    };
    void run();
  }, [supabase]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, students]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!studentId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("A student and a positive amount are required.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("fee_dues").insert({
      student_id: studentId,
      amount: parsedAmount,
      fee_period: feePeriod.trim(),
      due_date: dueDate || null,
      notes: notes.trim(),
    });
    setIsSaving(false);

    if (error) {
      setFormError("Couldn't create this due. Make sure you're signed in as an admin.");
      return;
    }

    setStudentId("");
    setAmount("");
    setFeePeriod("");
    setDueDate("");
    setNotes("");
    void load();
  };

  const markPaidManually = async (due: FeeDue) => {
    if (!supabase) return;
    setRowActionId(due.id);

    const method = manualMethod[due.id] || "cash";
    const { error: paymentError } = await supabase.from("fee_payments").insert({
      receipt_number: generateReceiptNumber(),
      student_id: due.studentId,
      payer_name: due.studentName,
      amount: due.amount,
      payment_method: method,
      fee_period: due.feePeriod,
      notes: "Marked paid manually against a fee due.",
      due_id: due.id,
      gateway: "manual",
    });

    if (!paymentError) {
      await supabase.from("fee_dues").update({ status: "paid" }).eq("id", due.id);
    }

    setRowActionId(null);
    void load();
  };

  const cancelDue = async (due: FeeDue) => {
    if (!supabase) return;
    setRowActionId(due.id);
    await supabase.from("fee_dues").update({ status: "cancelled" }).eq("id", due.id);
    setRowActionId(null);
    void load();
  };

  const dues = state.status === "ready" ? state.dues : [];
  const visibleDues = dues.filter((due) => due.status === statusFilter);
  const totalPending = dues.filter((due) => due.status === "pending").reduce((sum, due) => sum + due.amount, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
            <IndianRupee className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Fee Dues</h1>
            <p className="mt-1 text-sm text-slate-500">
              Raise a due against a student — they can pay it online from their dashboard, or you can mark it
              paid manually here.
            </p>
          </div>
        </div>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so fee dues can&apos;t load — expected in
          local/preview setups without env vars set.
        </p>
      )}

      {state.status === "ready" && (
        <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <p className="flex items-center gap-2 text-3xl font-bold text-white">
            <IndianRupee className="h-6 w-6 text-amber-400" />
            {formatCurrency(totalPending).replace("₹", "")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Outstanding · {dues.filter((due) => due.status === "pending").length} pending dues
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
            <label htmlFor="due-student" className="text-sm font-medium text-slate-300">Student</label>
            <select
              id="due-student"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="" className="bg-slate-900">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id} className="bg-slate-900">
                  {student.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="due-amount" className="text-sm font-medium text-slate-300">Amount</label>
            <input
              id="due-amount"
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
            <label htmlFor="due-period" className="text-sm font-medium text-slate-300">
              Fee period <span className="text-slate-600">(optional)</span>
            </label>
            <input
              id="due-period"
              type="text"
              value={feePeriod}
              onChange={(event) => setFeePeriod(event.target.value)}
              placeholder="e.g. Term 1, 2026"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label htmlFor="due-date" className="text-sm font-medium text-slate-300">
              Due date <span className="text-slate-600">(optional)</span>
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="due-notes" className="text-sm font-medium text-slate-300">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              id="due-notes"
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
          Raise Due
        </button>
      </form>

      <div className="flex gap-2">
        {(["pending", "paid", "cancelled"] as DueStatus[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              statusFilter === tab
                ? "bg-amber-500 text-slate-950"
                : "border border-slate-700 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />

        {state.status === "loading" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "ready" && visibleDues.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No {statusFilter} dues.</p>
        )}

        {state.status === "ready" &&
          visibleDues.map((due) => (
            <div
              key={due.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{due.studentName}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {due.feePeriod || "No period set"}
                  {due.dueDate ? ` · Due ${formatDate(due.dueDate)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-amber-400">{formatCurrency(due.amount)}</p>
                {due.status === "pending" && (
                  <>
                    <select
                      value={manualMethod[due.id] || "cash"}
                      onChange={(event) =>
                        setManualMethod((current) => ({ ...current, [due.id]: event.target.value as ManualPaymentMethod }))
                      }
                      className="appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs text-white outline-none"
                    >
                      {(Object.entries(MANUAL_METHOD_LABEL) as [ManualPaymentMethod, string][]).map(([value, label]) => (
                        <option key={value} value={value} className="bg-slate-900">
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={rowActionId === due.id}
                      onClick={() => void markPaidManually(due)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      {rowActionId === due.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Mark Paid
                    </button>
                    <button
                      type="button"
                      disabled={rowActionId === due.id}
                      onClick={() => void cancelDue(due)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
