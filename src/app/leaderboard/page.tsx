import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";
import { resolveExamInfo } from "@/lib/student/exam-info";

export const metadata: Metadata = {
  title: "Leaderboard | TestPulse AI",
  description:
    "See how top students are ranking across every subject on TestPulse AI.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getLeaderboardData(): Promise<{
  entries: LeaderboardEntry[];
  isAvailable: boolean;
}> {
  noStore();

  if (!supabase) {
    return { entries: [], isAvailable: false };
  }

  try {
    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("id, exam_id, student_name, student_id, score, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const rows = data ?? [];
    const examIds = [...new Set(rows.map((row) => row.exam_id))];
    const examInfo = await resolveExamInfo(examIds);

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

    return { entries, isAvailable: true };
  } catch (error) {
    console.error("[leaderboard] Failed to load leaderboard data:", error);
    return { entries: [], isAvailable: false };
  }
}

export default async function LeaderboardPage() {
  const { entries, isAvailable } = await getLeaderboardData();

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <LeaderboardView entries={entries} isAvailable={isAvailable} />
      <Footer />
    </div>
  );
}
