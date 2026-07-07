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

export const MOCK_EXAMS: Record<string, MockExam[]> = {
  "general-knowledge": [
    {
      id: "gk-indian-history-101",
      title: "Indian History Quiz",
      questionCount: 20,
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
      questionCount: 25,
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
      questionCount: 20,
      durationMinutes: 35,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "math-advanced-trigonometry-301",
      title: "Advanced Trigonometry Challenge",
      questionCount: 25,
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
      questionCount: 20,
      durationMinutes: 30,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "science-quantum-mechanics-301",
      title: "Quantum Mechanics Deep Dive",
      questionCount: 20,
      durationMinutes: 40,
      difficulty: "Hard",
      status: "locked",
    },
  ],
  "current-affairs": [
    {
      id: "current-affairs-weekly-digest-101",
      title: "This Week in Current Affairs",
      questionCount: 10,
      durationMinutes: 15,
      difficulty: "Easy",
      status: "available",
    },
    {
      id: "current-affairs-global-policy-201",
      title: "Global Policy & Economics Digest",
      questionCount: 20,
      durationMinutes: 30,
      difficulty: "Medium",
      status: "available",
    },
    {
      id: "current-affairs-championship-301",
      title: "Current Affairs Championship",
      questionCount: 25,
      durationMinutes: 45,
      difficulty: "Hard",
      status: "locked",
    },
  ],
};
