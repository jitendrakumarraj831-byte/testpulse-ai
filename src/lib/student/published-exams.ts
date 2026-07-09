import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
} from "@/lib/admin/question-generator";
import type { MockExam } from "@/lib/student/exams";
import { estimateDurationMinutes } from "@/lib/student/resolve-test";
import { resolveSubjectMeta } from "@/lib/student/subjects";
import { supabase } from "@/lib/supabase";

/** Real exams published via the admin AI generator (`/api/exams/publish`),
 * shaped to slot directly into the same subject-page grid as `MOCK_EXAMS` —
 * without this, a freshly-published exam was only ever reachable through
 * the raw `/test/{id}` link shown once in the admin UI, never by browsing
 * `/exams/[subject]` like every mock exam. */
export async function getPublishedExamsForSubject(
  subjectSlug: string,
): Promise<MockExam[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject, difficulty, questions, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data
      .filter((row) => resolveSubjectMeta(row.subject).slug === subjectSlug)
      .map((row): MockExam | null => {
        const questionCount = Array.isArray(row.questions) ? row.questions.length : 0;
        if (questionCount === 0) return null;

        const difficulty = (DIFFICULTY_LEVELS as readonly string[]).includes(row.difficulty)
          ? (row.difficulty as DifficultyLevel)
          : "Medium";

        return {
          id: row.id,
          title: row.title,
          questionCount,
          durationMinutes: estimateDurationMinutes(questionCount, difficulty),
          difficulty,
          status: "available",
        };
      })
      .filter((exam): exam is MockExam => exam !== null);
  } catch (error) {
    console.error("[published-exams] Failed to load published exams:", error);
    return [];
  }
}
