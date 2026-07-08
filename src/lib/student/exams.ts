import type { DifficultyLevel } from "@/lib/admin/question-generator";

export type ExamStatus = "available" | "locked";

export interface MockExam {
  id: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  difficulty: DifficultyLevel;
  status: ExamStatus;
}

/**
 * Every exam draws its questions from that subject's fixed 15-question
 * bank (see question-bank.ts), so questionCount is pinned to 15 across
 * the board — it must never claim more questions than the bank has.
 */
export const MOCK_EXAMS: Record<string, MockExam[]> = {
  "general-knowledge": [
    {
      id: "gk-indian-history-101",
      title: "Indian History Quiz",
      questionCount: 15,
      durationMinutes: 30,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "gk-world-geography-201",
      title: "World Geography Challenge",
      questionCount: 15,
      durationMinutes: 25,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "gk-static-gk-championship-301",
      title: "Static GK Championship Round",
      questionCount: 15,
      durationMinutes: 40,
      difficulty: "Hard",
      status: "locked",
    },
  ],
  mathematics: [
    {
      id: "math-algebra-fundamentals-101",
      title: "Algebra Fundamentals Test",
      questionCount: 15,
      durationMinutes: 20,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "math-calculus-speed-201",
      title: "Calculus Speed Round",
      questionCount: 15,
      durationMinutes: 35,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "math-advanced-trigonometry-301",
      title: "Advanced Trigonometry Challenge",
      questionCount: 15,
      durationMinutes: 45,
      difficulty: "Hard",
      status: "locked",
    },
  ],
  science: [
    {
      id: "science-rotational-dynamics-101",
      title: "Rotational Dynamics Mock Test",
      questionCount: 15,
      durationMinutes: 25,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "science-organic-chemistry-201",
      title: "Organic Chemistry Basics",
      questionCount: 15,
      durationMinutes: 30,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "science-quantum-mechanics-301",
      title: "Quantum Mechanics Deep Dive",
      questionCount: 15,
      durationMinutes: 40,
      difficulty: "Hard",
      status: "locked",
    },
  ],
  "current-affairs": [
    {
      id: "current-affairs-weekly-digest-101",
      title: "This Week in Current Affairs",
      questionCount: 15,
      durationMinutes: 15,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "current-affairs-global-policy-201",
      title: "Global Policy & Economics Digest",
      questionCount: 15,
      durationMinutes: 30,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "current-affairs-championship-301",
      title: "Current Affairs Championship",
      questionCount: 15,
      durationMinutes: 45,
      difficulty: "Hard",
      status: "locked",
    },
  ],
};

/** AI-published exams don't store a duration, so estimate one from question count and difficulty, roughly matching the mock catalog's pacing. */
export function estimateDurationMinutes(
  questionCount: number,
  difficulty: DifficultyLevel,
): number {
  const perQuestionMinutes =
    difficulty === "Hard" ? 2 : difficulty === "Medium" ? 1.5 : 1;
  return Math.max(10, Math.round(questionCount * perQuestionMinutes));
}

export interface ExamLookupResult {
  exam: MockExam;
  subjectSlug: string;
}

/** Reverse-looks-up an exam by its ID across all subjects, returning the owning subject slug too. */
export function getExamById(testId: string): ExamLookupResult | undefined {
  for (const [subjectSlug, exams] of Object.entries(MOCK_EXAMS)) {
    const exam = exams.find((item) => item.id === testId);
    if (exam) {
      return { exam, subjectSlug };
    }
  }
  return undefined;
}
