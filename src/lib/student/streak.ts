const STORAGE_KEY = "testpulse:quiz-history";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface HistoryEntry {
  /** UTC calendar day, "YYYY-MM-DD". */
  date: string;
  accuracy: number;
}

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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / MS_PER_DAY);
}

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — streak
    // tracking just degrades silently, it's not load-bearing for the exam itself.
  }
}

/** Records this device's completion of a test. Call once per graded submission. */
export function recordQuizCompletion(score: number, totalQuestions: number): void {
  if (totalQuestions <= 0) return;
  const accuracy = Math.round((score / totalQuestions) * 100);
  const history = readHistory();
  const today = todayKey();
  const todayIndex = history.findIndex((entry) => entry.date === today);

  if (todayIndex >= 0) {
    history[todayIndex] = {
      date: today,
      accuracy: Math.max(history[todayIndex].accuracy, accuracy),
    };
  } else {
    history.push({ date: today, accuracy });
  }
  writeHistory(history);
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

/** Reads this device's local quiz history and derives streak/badge state. Client-only — call from a useEffect. */
export function getStreakSummary(): StreakSummary {
  const history = [...readHistory()].sort((a, b) => a.date.localeCompare(b.date));

  if (history.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalAttempts: 0,
      averageAccuracy: 0,
      badges: buildBadges(0, 0, 0),
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;
  for (let i = 1; i < history.length; i += 1) {
    const gap = daysBetween(history[i - 1].date, history[i].date);
    if (gap === 1) {
      runningStreak += 1;
    } else if (gap > 1) {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const lastEntry = history[history.length - 1];
  const gapFromToday = daysBetween(lastEntry.date, todayKey());
  // A streak is still "live" if the most recent attempt was today or yesterday.
  const currentStreak = gapFromToday <= 1 ? runningStreak : 0;

  const totalAttempts = history.length;
  const averageAccuracy = Math.round(
    history.reduce((sum, entry) => sum + entry.accuracy, 0) / totalAttempts,
  );

  return {
    currentStreak,
    longestStreak,
    totalAttempts,
    averageAccuracy,
    badges: buildBadges(currentStreak, totalAttempts, averageAccuracy),
  };
}
