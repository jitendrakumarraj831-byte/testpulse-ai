import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { resolveExamInfo } from "@/lib/student/exam-info";
import { computeStreakSummary, type StreakSourceRow } from "@/lib/student/streak";
import { aggregateLeaderboard, type LeaderboardEntry } from "@/lib/student/leaderboard";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";

export const metadata: Metadata = {
  title: "Student Dashboard | TestPulse AI",
  description: "Your submissions, streak, and institute rank in one premium panel.",
};

export const dynamic = "force-dynamic";

interface LeaderboardRow {
  id: string;
  exam_id: string;
  student_name: string;
  student_id: string | null;
  score: number | null;
  submitted_at: string;
}

export default async function StudentDashboardPage() {
  noStore();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "Student";

  const { data } = await supabase
    .from("leaderboard_entries")
    .select("id, exam_id, student_name, student_id, score, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(2000);

  const rows = (data ?? []) as LeaderboardRow[];
  const examIds = [...new Set(rows.map((row) => row.exam_id))];
  const examInfo = await resolveExamInfo(examIds);

  // This account's own submissions — student_id only reflects rows
  // submitted while signed in, so pre-migration/anonymous attempts under
  // the same name won't retroactively appear here (see schema.sql).
  const myRows: StreakSourceRow[] = rows
    .filter((row) => row.student_id === user.id)
    .map((row) => ({ exam_id: row.exam_id, score: row.score, submitted_at: row.submitted_at }));

  const streak = computeStreakSummary(myRows, examInfo);

  const entries: LeaderboardEntry[] = rows.map((row) => {
    const info = examInfo[row.exam_id];
    return {
      id: row.id,
      studentName: row.student_name,
      studentId: row.student_id,
      subjectSlug: info?.subjectSlug ?? "unknown",
      subjectName: info?.subjectName ?? "Unknown",
      score: Number(row.score ?? 0),
      totalQuestions: info?.totalQuestions ?? 0,
      submittedAt: row.submitted_at,
    };
  });

  const ranked = aggregateLeaderboard(entries, "all", "all");
  const myRank = ranked.find((entry) => entry.studentId === user.id)?.rank ?? null;

  return (
    <StudentDashboardView
      displayName={displayName}
      totalSubmissions={streak.totalAttempts}
      currentStreak={streak.currentStreak}
      instituteRank={myRank}
      rankedStudentCount={ranked.length}
    />
  );
}
