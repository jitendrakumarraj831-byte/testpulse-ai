export interface LeaderboardEntry {
  id: string;
  studentName: string;
  subjectSlug: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

/** A ranked row plus enough to show whether the student's most recent
 * submission moved them up or down the board. `previousRank` is null when
 * this is the student's first submission within the current filter (there's
 * nothing to compare against yet). */
export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  previousRank: number | null;
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

interface StudentAggregate {
  key: string;
  /** Best-scoring submission across this student's full history — the row shown on the board. */
  best: LeaderboardEntry;
  /** Best-scoring submission excluding their single most recent one, or null if they only have one submission. */
  bestExcludingLatest: LeaderboardEntry | null;
}

/** Filters entries, keeps each student's best-scoring attempt, ranks highest
 * first, and computes a real "previous rank" per student — their rank as it
 * would be if their most recent submission hadn't happened, holding every
 * other student's current best fixed. That isolates whether *their* latest
 * attempt is what moved them, rather than mixing in everyone else's activity. */
export function aggregateLeaderboard(
  entries: LeaderboardEntry[],
  subjectFilter: SubjectFilter,
  timeframeFilter: TimeframeFilter,
): RankedLeaderboardEntry[] {
  const cutoff = timeframeCutoff(timeframeFilter);

  const filtered = entries.filter((entry) => {
    if (subjectFilter !== "all" && entry.subjectSlug !== subjectFilter) {
      return false;
    }
    if (new Date(entry.submittedAt).getTime() < cutoff) return false;
    return true;
  });

  const byStudent = new Map<string, LeaderboardEntry[]>();
  for (const entry of filtered) {
    const key = entry.studentName.trim().toLowerCase();
    const list = byStudent.get(key);
    if (list) {
      list.push(entry);
    } else {
      byStudent.set(key, [entry]);
    }
  }

  const aggregates: StudentAggregate[] = [...byStudent.entries()].map(
    ([key, list]) => {
      const sortedByTime = [...list].sort(
        (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      );
      const withoutLatest = sortedByTime.slice(0, -1);

      const best = list.reduce((top, entry) => (entry.score > top.score ? entry : top));
      const bestExcludingLatest =
        withoutLatest.length > 0
          ? withoutLatest.reduce((top, entry) => (entry.score > top.score ? entry : top))
          : null;

      return { key, best, bestExcludingLatest };
    },
  );

  const currentRanked = [...aggregates].sort((a, b) => b.best.score - a.best.score);

  return currentRanked.map((aggregate, index) => {
    let previousRank: number | null = null;

    if (aggregate.bestExcludingLatest) {
      const priorScore = aggregate.bestExcludingLatest.score;
      const outrankedBy = currentRanked.filter(
        (other) => other.key !== aggregate.key && other.best.score >= priorScore,
      ).length;
      previousRank = outrankedBy + 1;
    }

    return {
      ...aggregate.best,
      rank: index + 1,
      previousRank,
    };
  });
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
