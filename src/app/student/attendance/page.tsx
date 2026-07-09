import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { CheckSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AttendanceStatus } from "@/lib/academic-hub/types";

export const metadata: Metadata = {
  title: "Attendance | TestPulse AI",
  description: "Your attendance history and overall rate.",
};

export const dynamic = "force-dynamic";

interface AttendanceRow {
  attendance_date: string;
  status: AttendanceStatus;
}

const STATUS_BADGE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  late: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  absent: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function StudentAttendancePage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/attendance");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/attendance");
  }

  const { data } = await supabase
    .from("attendance_records")
    .select("attendance_date, status")
    .eq("student_id", user.id)
    .order("attendance_date", { ascending: false });

  const records = (data ?? []) as AttendanceRow[];
  const presentOrLate = records.filter((row) => row.status !== "absent").length;
  const attendanceRate =
    records.length > 0 ? Math.round((presentOrLate / records.length) * 100) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
          <CheckSquare className="h-3.5 w-3.5" />
          Attendance
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your Attendance
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Every day your institute has recorded, with your overall rate.
        </p>
      </div>

      <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
        <p className="text-3xl font-bold text-white">
          {attendanceRate !== null ? `${attendanceRate}%` : "No data yet"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {records.length > 0
            ? `${presentOrLate} of ${records.length} recorded days present or late`
            : "Your institute hasn't recorded any attendance for you yet."}
        </p>
      </div>

      {records.length > 0 && (
        <div className="card-glow overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          {records.map((row) => (
            <div
              key={row.attendance_date}
              className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-3.5 last:border-0"
            >
              <p className="text-sm text-slate-300">{formatDate(row.attendance_date)}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[row.status]}`}>
                {STATUS_LABEL[row.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
