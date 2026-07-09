import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/utils/supabase/server";
import { resolveExamInfo } from "@/lib/student/exam-info";
import { computeStreakSummary, type StreakSourceRow } from "@/lib/student/streak";
import { aggregateLeaderboard, type LeaderboardEntry } from "@/lib/student/leaderboard";

interface LeaderboardRow {
  id: string;
  exam_id: string;
  student_name: string;
  student_id: string | null;
  score: number | null;
  submitted_at: string;
}

export interface StudentDashboardData {
  displayName: string;
  totalSubmissions: number;
  currentStreak: number;
  instituteRank: number | null;
  rankedStudentCount: number;
}

/** Shared by the student dashboard route and the unified home gateway
 * (`/src/app/page.tsx`) so both render identical, non-duplicated logic for
 * "this signed-in student's" streak, submission count, and leaderboard rank. */
export async function getStudentDashboardData(
  supabase: ReturnType<typeof createClient>,
  user: User,
): Promise<StudentDashboardData> {
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

  return {
    displayName,
    totalSubmissions: streak.totalAttempts,
    currentStreak: streak.currentStreak,
    instituteRank: myRank,
    rankedStudentCount: ranked.length,
  };
}
