import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";
import { getExamById } from "@/lib/student/exams";
import { getSubjectBySlug, SUBJECTS } from "@/lib/student/subjects";

export const metadata: Metadata = {
  title: "Leaderboard | TestPulse AI",
  description:
    "See how top students are ranking across every subject on TestPulse AI.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface ExamInfo {
  subjectSlug: string;
  subjectName: string;
  totalQuestions: number;
}

/** Resolves subject + question-count metadata for a batch of exam_ids, checking the hardcoded mock catalog first and falling back to a real `exams` row lookup for anything unresolved (e.g. AI-generated exams published via the uploader). */
async function resolveExamInfo(
  examIds: string[],
): Promise<Record<string, ExamInfo>> {
  const resolved: Record<string, ExamInfo> = {};
  const unresolved: string[] = [];

  for (const examId of examIds) {
    const lookup = getExamById(examId);
    if (lookup) {
      const subject = getSubjectBySlug(lookup.subjectSlug);
      resolved[examId] = {
        subjectSlug: lookup.subjectSlug,
        subjectName: subject?.name ?? lookup.subjectSlug,
        totalQuestions: lookup.exam.questionCount,
      };
    } else {
      unresolved.push(examId);
    }
  }

  if (unresolved.length > 0 && supabase) {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, subject, questions")
        .in("id", unresolved);

      if (error) throw error;

      for (const row of data ?? []) {
        const subjectSlug =
          SUBJECTS.find(
            (candidate) =>
              candidate.name.toLowerCase() === String(row.subject).toLowerCase(),
          )?.slug ?? "unknown";
        resolved[row.id] = {
          subjectSlug,
          subjectName: row.subject,
          totalQuestions: Array.isArray(row.questions) ? row.questions.length : 0,
        };
      }
    } catch (error) {
      console.error("[leaderboard] Failed to resolve published exams:", error);
    }
  }

  return resolved;
}

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
      .select("id, exam_id, student_name, score, submitted_at")
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
