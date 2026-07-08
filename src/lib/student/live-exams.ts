import { DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/admin/question-generator";
import { estimateDurationMinutes, type MockExam } from "@/lib/student/exams";
import { matchesSubjectSlug } from "@/lib/student/subjects";
import { supabase } from "@/lib/supabase";

export interface LiveExam extends MockExam {
  isLive: true;
}

/**
 * Fetches admin-published exams (from the AI generator or bulk uploader)
 * that belong under a given browsable subject slug, so a freshly published
 * test shows up in `/exams/[subject]` alongside the curated mock catalog
 * instead of only being reachable via its direct `/test/[id]` link.
 * Returns `[]` on any failure or when Supabase isn't configured — the
 * page falls back to the mock catalog only, exactly as before.
 */
export async function getLiveExamsForSubject(
  subjectSlug: string,
): Promise<LiveExam[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject, difficulty, questions, created_at")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data
      .filter((row) => matchesSubjectSlug(row.subject, subjectSlug))
      .map((row): LiveExam => {
        const questionCount = Array.isArray(row.questions)
          ? row.questions.length
          : 0;
        const difficulty = (
          DIFFICULTY_LEVELS as readonly string[]
        ).includes(row.difficulty)
          ? (row.difficulty as DifficultyLevel)
          : "Medium";

        return {
          id: row.id,
          title: row.title,
          questionCount,
          durationMinutes: estimateDurationMinutes(questionCount, difficulty),
          difficulty,
          status: "available",
          isLive: true,
        };
      })
      .filter((exam) => exam.questionCount > 0);
  } catch (error) {
    console.error("[live-exams] Failed to load published exams:", error);
    return [];
  }
}
