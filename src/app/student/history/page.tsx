import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { History as HistoryIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { resolveExamInfo } from "@/lib/student/exam-info";
import { formatRelativeTime } from "@/lib/student/leaderboard";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

export const metadata: Metadata = {
  title: "Review History | TestPulse AI",
  description: "Every exam you've submitted, with subject, score, and when you took it.",
};

export const dynamic = "force-dynamic";

function accuracyTone(percent: number | null): string {
  if (percent === null) return "text-slate-400";
  if (percent >= 70) return "text-emerald-400";
  if (percent >= 40) return "text-amber-400";
  return "text-rose-400";
}

export default async function StudentHistoryPage() {
  noStore();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/history");
  }

  const { data } = await supabase
    .from("student_responses")
    .select("id, exam_id, score, submitted_at")
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(500);

  const rows = data ?? [];
  const examIds = [...new Set(rows.map((row) => row.exam_id))];
  const examInfo = await resolveExamInfo(examIds);

  const entries = rows.map((row) => {
    const info = examInfo[row.exam_id];
    const totalQuestions = info?.totalQuestions ?? 0;
    const score = Number(row.score ?? 0);
    return {
      id: row.id,
      subjectName: info?.subjectName ?? "Unknown subject",
      score,
      totalQuestions,
      accuracyPercent: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : null,
      submittedAt: row.submitted_at,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          <HistoryIcon className="h-3.5 w-3.5" />
          Review History
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your Submissions
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Only exams submitted while signed in show up here — anonymous attempts made before you
          had an account aren&apos;t linked to it.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-md">
          <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />
          <p className="text-sm text-slate-400">
            No submissions yet — head to the Exam Arena to take your first test.
          </p>
        </div>
      ) : (
        <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />
          <ul className="divide-y divide-slate-800">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{entry.subjectName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatRelativeTime(entry.submittedAt)}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-bold ${accuracyTone(entry.accuracyPercent)}`}>
                  {entry.score}/{entry.totalQuestions || "—"}
                  {entry.accuracyPercent !== null ? ` (${entry.accuracyPercent}%)` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
