import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  Receipt,
  Sparkles,
  UploadCloud,
  UserCog,
  Users,
} from "lucide-react";

interface AdminHomeOverviewProps {
  feeTotalThisMonth: number;
  feeReceiptCount: number;
  attendancePresentCount: number;
  attendanceTotalMarked: number;
  studentCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminHomeOverview({
  feeTotalThisMonth,
  feeReceiptCount,
  attendancePresentCount,
  attendanceTotalMarked,
  studentCount,
}: AdminHomeOverviewProps) {
  const attendanceRate =
    attendanceTotalMarked > 0 ? Math.round((attendancePresentCount / attendanceTotalMarked) * 100) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          Control center
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Institute Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/fees"
          className="card-glow group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:border-amber-500/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30">
            <Receipt className="h-5 w-5 text-amber-400" />
          </span>
          <p className="mt-4 text-2xl font-bold text-white">{formatCurrency(feeTotalThisMonth)}</p>
          <p className="mt-1 text-sm text-slate-500">Collected this month · {feeReceiptCount} receipts</p>
        </Link>

        <Link
          href="/admin/attendance"
          className="card-glow group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:border-emerald-500/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
          </span>
          <p className="mt-4 text-2xl font-bold text-white">
            {attendanceRate !== null ? `${attendanceRate}%` : "No data yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Today&apos;s attendance
            {attendanceTotalMarked > 0 ? ` · ${attendancePresentCount}/${attendanceTotalMarked} present` : ""}
          </p>
        </Link>

        <Link
          href="/admin/students"
          className="card-glow group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:border-cyan-500/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <Users className="h-5 w-5 text-cyan-400" />
          </span>
          <p className="mt-4 text-2xl font-bold text-white">{studentCount}</p>
          <p className="mt-1 text-sm text-slate-500">Registered students</p>
        </Link>

        <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
            <UserCog className="h-5 w-5 text-violet-400" />
          </span>
          <p className="mt-4 text-sm font-semibold text-white">Manage Directory</p>
          <p className="mt-1 text-sm text-slate-500">Suspend, reset, or remove student accounts</p>
          <Link
            href="/admin/students"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Open <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400">Exam Deployment</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/ai-generator"
            className="card-glow group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-all hover:border-cyan-500/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">AI Question Generator</p>
              <p className="text-xs text-slate-500">Generate and publish a new exam</p>
            </div>
          </Link>
          <Link
            href="/admin/upload-questions"
            className="card-glow group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-all hover:border-emerald-500/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <UploadCloud className="h-5 w-5 text-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Bulk Uploader</p>
              <p className="text-xs text-slate-500">Import questions from Excel, CSV, or text</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
