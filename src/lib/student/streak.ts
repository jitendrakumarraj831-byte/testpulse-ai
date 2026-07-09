import { supabase } from "@/lib/supabase";
import { resolveExamInfo, type ExamInfo } from "@/lib/student/exam-info";

const NAME_STORAGE_KEY = "testpulse:student-name";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface StreakBadge {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalAttempts: number;
  averageAccuracy: number;
  badges: StreakBadge[];
}

/** The name typed into the exam name field, remembered locally so a returning
 * student's real Supabase submission history can be looked back up by name —
 * there's no auth yet, so this is name-scoped, not account-scoped (same
 * caveat the public leaderboard already carries). */
export function getStoredStudentName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function rememberStudentName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    // localStorage unavailable — the name field just won't be remembered next visit.
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / MS_PER_DAY);
}

function buildBadges(
  currentStreak: number,
  totalAttempts: number,
  averageAccuracy: number,
): StreakBadge[] {
  return [
    {
      id: "first-steps",
      label: "First Steps",
      description: "Complete your first test",
      unlocked: totalAttempts >= 1,
    },
    {
      id: "consistency-king",
      label: "Consistency King",
      description: "Reach a 3-day test-taking streak",
      unlocked: currentStreak >= 3,
    },
    {
      id: "accuracy-master",
      label: "Accuracy Master",
      description: "Keep your average accuracy at 90% or higher",
      unlocked: totalAttempts >= 1 && averageAccuracy >= 90,
    },
  ];
}

export function emptyStreakSummary(): StreakSummary {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalAttempts: 0,
    averageAccuracy: 0,
    badges: buildBadges(0, 0, 0),
  };
}

export interface StreakSourceRow {
  exam_id: string;
  score: number | null;
  submitted_at: string;
}

/** Pure computation over a student's already-fetched submission rows — no
 * network access, so it's safe to call in bulk (e.g. once per student in a
 * directory view) without triggering an extra Supabase query per student. */
export function computeStreakSummary(
  rows: StreakSourceRow[],
  examInfo: Record<string, ExamInfo>,
): StreakSummary {
  if (rows.length === 0) return emptyStreakSummary();

  const accuracies: number[] = [];
  const bestAccuracyByDay = new Map<string, number>();

  for (const row of rows) {
    const totalQuestions = examInfo[row.exam_id]?.totalQuestions ?? 0;
    if (totalQuestions <= 0) continue;
    const accuracy = Math.round((Number(row.score ?? 0) / totalQuestions) * 100);
    accuracies.push(accuracy);
    const day = row.submitted_at.slice(0, 10);
    bestAccuracyByDay.set(day, Math.max(bestAccuracyByDay.get(day) ?? 0, accuracy));
  }

  if (accuracies.length === 0) return emptyStreakSummary();

  const days = [...bestAccuracyByDay.keys()].sort();

  let longestStreak = 1;
  let runningStreak = 1;
  for (let i = 1; i < days.length; i += 1) {
    const gap = daysBetween(days[i - 1], days[i]);
    if (gap === 1) {
      runningStreak += 1;
    } else if (gap > 1) {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const gapFromToday = daysBetween(days[days.length - 1], todayKey());
  // A streak is still "live" if the most recent attempt was today or yesterday.
  const currentStreak = gapFromToday <= 1 ? runningStreak : 0;

  const totalAttempts = rows.length;
  const averageAccuracy = Math.round(
    accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length,
  );

  return {
    currentStreak,
    longestStreak,
    totalAttempts,
    averageAccuracy,
    badges: buildBadges(currentStreak, totalAttempts, averageAccuracy),
  };
}

/** Computes real streak/badge state from this student's actual Supabase submission
 * history. Matched by `student_id` when a session exists (the reliable link
 * to their account), falling back to name-matching for older anonymous rows
 * or a logged-out visitor — same as the leaderboard's fallback. Call from a
 * useEffect — reads from the network. */
export async function getStreakSummary(
  studentName: string,
  studentId?: string | null,
): Promise<StreakSummary> {
  const trimmedName = studentName.trim();
  if (!supabase || (!studentId && !trimmedName)) return emptyStreakSummary();

  const query = supabase
    .from("student_responses")
    .select("exam_id, score, submitted_at")
    .order("submitted_at", { ascending: true })
    .limit(500);

  const { data, error } = studentId
    ? await query.eq("student_id", studentId)
    : await query.eq("student_name", trimmedName);

  if (error || !data || data.length === 0) return emptyStreakSummary();

  const examIds = [...new Set(data.map((row) => row.exam_id))];
  const examInfo = await resolveExamInfo(examIds);

  return computeStreakSummary(data, examInfo);
}
