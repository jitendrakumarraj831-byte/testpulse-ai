import { DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/admin/question-generator";
import { estimateDurationMinutes, type MockExam } from "@/lib/student/exams";
import { getSubjectLabelAliases, matchesSubjectSlug } from "@/lib/student/subjects";
import { supabase } from "@/lib/supabase";

export interface LiveExam extends MockExam {
  isLive: true;
}

/**
 * Fetches admin-published exams (from the AI generator or bulk uploader)
 * that belong under a given browsable subject slug, so a freshly published
 * test shows up in `/exams/[subject]` alongside the curated mock catalog
 * instead of only being reachable via its direct `/test/[id]` link.
 * Returns `[]` on any failure, when Supabase isn't configured, or when
 * the slug isn't recognized — the page falls back to the mock catalog
 * only, exactly as before.
 *
 * Filtering happens in two layers so an exam can never render under the
 * wrong subject page:
 *  1. A case-insensitive `.or(subject.ilike...)` filter at the database
 *     level — the real, strict `subject` match (handles "gk" vs
 *     "General Knowledge", "physics" vs "Physics", etc.), and cheaper
 *     than pulling every row in the table on every page view.
 *  2. `matchesSubjectSlug` re-checks every returned row in application
 *     code as a hard guard, in case the DB filter's alias list ever
 *     drifts out of sync with `SUBJECT_LABEL_ALIASES`.
 */
export async function getLiveExamsForSubject(
  subjectSlug: string,
): Promise<LiveExam[]> {
  if (!supabase) return [];

  const aliases = getSubjectLabelAliases(subjectSlug);
  if (aliases.length === 0) return [];

  try {
    const orFilter = aliases
      .map((alias) => `subject.ilike.${alias}`)
      .join(",");

    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject, difficulty, questions, created_at")
      .or(orFilter)
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
