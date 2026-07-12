import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { IndianRupee } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { razorpayPublicKeyId } from "@/lib/payments/razorpay";
import { FeeDuesPanel, type FeeDue, type FeePaymentHistoryItem } from "@/components/student/FeeDuesPanel";

export const metadata: Metadata = {
  title: "Fees | TestPulse AI",
  description: "Your pending dues and payment history.",
};

export const dynamic = "force-dynamic";

interface FeeDueRow {
  id: string;
  amount: number;
  fee_period: string;
  due_date: string | null;
  notes: string;
}

interface FeePaymentRow {
  id: string;
  receipt_number: string;
  amount: number;
  fee_period: string;
  gateway: "manual" | "razorpay";
  paid_at: string;
}

export default async function StudentFeesPage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/fees");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/fees");
  }

  const [profileResult, duesResult, paymentsResult] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
    supabase
      .from("fee_dues")
      .select("id, amount, fee_period, due_date, notes")
      .eq("student_id", user.id)
      .eq("status", "pending")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("fee_payments")
      .select("id, receipt_number, amount, fee_period, gateway, paid_at")
      .eq("student_id", user.id)
      .order("paid_at", { ascending: false })
      .limit(25),
  ]);

  const dues: FeeDue[] = ((duesResult.data ?? []) as FeeDueRow[]).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    feePeriod: row.fee_period,
    dueDate: row.due_date,
    notes: row.notes,
  }));

  const payments: FeePaymentHistoryItem[] = ((paymentsResult.data ?? []) as FeePaymentRow[]).map((row) => ({
    id: row.id,
    receiptNumber: row.receipt_number,
    amount: Number(row.amount),
    feePeriod: row.fee_period,
    gateway: row.gateway,
    paidAt: row.paid_at,
  }));

  const totalDue = dues.reduce((sum, due) => sum + due.amount, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-300">
          <IndianRupee className="h-3.5 w-3.5" />
          Fees
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Fees</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Pay pending dues online, or check your receipts from payments already recorded.
        </p>
      </div>

      <FeeDuesPanel
        dues={dues}
        payments={payments}
        totalDue={totalDue}
        razorpayKeyId={razorpayPublicKeyId}
        studentName={profileResult.data?.full_name || profileResult.data?.email || "Student"}
        studentEmail={profileResult.data?.email || user.email || ""}
      />
    </div>
  );
}
