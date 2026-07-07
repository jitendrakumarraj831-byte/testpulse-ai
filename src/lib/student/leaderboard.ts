export interface LeaderboardEntry {
  id: string;
  studentName: string;
  subjectSlug: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export type SubjectFilter = "all" | string;
export type TimeframeFilter = "today" | "week" | "all";

function timeframeCutoff(timeframe: TimeframeFilter): number {
  if (timeframe === "all") return 0;
  if (timeframe === "week") return Date.now() - 7 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday.getTime();
}

/** Filters entries, then keeps only each student's single best-scoring attempt, ranked highest first. */
export function aggregateLeaderboard(
  entries: LeaderboardEntry[],
  subjectFilter: SubjectFilter,
  timeframeFilter: TimeframeFilter,
): LeaderboardEntry[] {
  const cutoff = timeframeCutoff(timeframeFilter);

  const filtered = entries.filter((entry) => {
    if (subjectFilter !== "all" && entry.subjectSlug !== subjectFilter) {
      return false;
    }
    if (new Date(entry.submittedAt).getTime() < cutoff) return false;
    return true;
  });

  const bestByStudent = new Map<string, LeaderboardEntry>();
  for (const entry of filtered) {
    const key = entry.studentName.trim().toLowerCase();
    const existing = bestByStudent.get(key);
    if (!existing || entry.score > existing.score) {
      bestByStudent.set(key, entry);
    }
  }

  return [...bestByStudent.values()].sort((a, b) => b.score - a.score);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
