import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getStudentDashboardData } from "@/lib/student/dashboard-data";
import { getUpcomingSchedule, getAssignmentsWithSubmissions } from "@/lib/academic-hub/data";
import { MOCK_EXAMS } from "@/lib/student/exams";
import { GuestGateway } from "@/components/landing/GuestGateway";
import { StudentAppHeader } from "@/components/student/StudentAppHeader";
import { StudentHomeOverview } from "@/components/student/StudentHomeOverview";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHomeOverview } from "@/components/admin/AdminHomeOverview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institute Gateway | TestPulse AI",
  description:
    "Sign in to your TestPulse AI institute workspace — student dashboards, admin management suite, and exam deployment.",
};

const AVAILABLE_EXAMS_COUNT = Object.values(MOCK_EXAMS)
  .flat()
  .filter((exam) => exam.status === "available").length;

/** Unified dynamic gateway, now living at /portal (the public "/" is a
 * separate guest-facing reading platform — see src/app/page.tsx): logged-out
 * visitors get exactly two entry points (Student Login / Admin Login), a
 * signed-in student lands directly on a homepage built entirely from their
 * own real data (schedule, homework, streak, Exam Arena), and a signed-in
 * admin lands on a homepage built entirely from institute-management data
 * (fee ledger, attendance, student directory, exam deployment) —
 * deliberately a different, narrower slice than the fuller analytics view
 * at /admin/dashboard. Each branch renders with only its own chrome
 * (GuestGateway, StudentAppHeader, or AdminShell) so none of the three
 * surfaces leak into another. */
export default async function PortalPage() {
  noStore();

  // No session is possible without Supabase configured — fall back to the
  // guest gateway instead of crashing, matching how the middleware (skips
  // its auth gate entirely) and every "unconfigured" empty state elsewhere
  // already degrade in local/preview environments without env vars set.
  if (!isSupabaseConfigured) {
    return <GuestGateway />;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestGateway />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name, batch")
    .eq("id", user.id)
    .maybeSingle();

  // Belt-and-suspenders: middleware already blocks suspended accounts from
  // /admin/* and /student/*, but /portal isn't one of those prefixes, and
  // this route renders the same dashboards directly — so it needs its own
  // check rather than relying solely on middleware for this gate.
  if (profile?.status === "suspended") {
    redirect("/auth/suspended");
  }

  if (profile?.role === "admin") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: feePayments }, { data: attendanceRows }, { count: studentCount }] = await Promise.all([
      supabase.from("fee_payments").select("amount").gte("paid_at", startOfMonth.toISOString()),
      supabase.from("attendance_records").select("status").eq("attendance_date", today),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    ]);

    const feeTotalThisMonth = (feePayments ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const attendancePresentCount = (attendanceRows ?? []).filter((row) => row.status !== "absent").length;

    return (
      <AdminShell>
        <AdminHomeOverview
          feeTotalThisMonth={feeTotalThisMonth}
          feeReceiptCount={(feePayments ?? []).length}
          attendancePresentCount={attendancePresentCount}
          attendanceTotalMarked={(attendanceRows ?? []).length}
          studentCount={studentCount ?? 0}
        />
      </AdminShell>
    );
  }

  const myBatch = profile?.batch ?? null;
  const [dashboardData, upcomingSchedule, { assignments, submissionsByAssignmentId }] = await Promise.all([
    getStudentDashboardData(supabase, user),
    getUpcomingSchedule(supabase, myBatch, 3),
    getAssignmentsWithSubmissions(supabase, user.id, myBatch),
  ]);

  const outstandingAssignments = assignments
    .filter((assignment) => !submissionsByAssignmentId[assignment.id])
    .slice(0, 4);

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <StudentAppHeader />
      <main className="flex-1">
        <StudentHomeOverview
          displayName={dashboardData.displayName}
          currentStreak={dashboardData.currentStreak}
          upcomingSchedule={upcomingSchedule}
          outstandingAssignments={outstandingAssignments}
          availableExamsCount={AVAILABLE_EXAMS_COUNT}
        />
      </main>
    </div>
  );
}
