import { cache } from "react";
import {
  DIFFICULTY_LEVELS,
  isApiQuestion,
  type ApiQuestion,
  type DifficultyLevel,
} from "@/lib/admin/question-generator";
import { getExamById } from "@/lib/student/exams";
import { getQuestionsForSubject } from "@/lib/student/question-bank";
import {
  getSubjectBySlug,
  resolveSubjectMeta,
  type SubjectMeta,
} from "@/lib/student/subjects";
import { supabase } from "@/lib/supabase";

export interface ResolvedTest {
  examId: string;
  examTitle: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questions: ApiQuestion[];
  subject: SubjectMeta;
}

/** AI-published exams don't store a duration, so estimate one from question count and difficulty, roughly matching the mock catalog's pacing. */
export function estimateDurationMinutes(
  questionCount: number,
  difficulty: DifficultyLevel,
): number {
  const perQuestionMinutes =
    difficulty === "Hard" ? 2 : difficulty === "Medium" ? 1.5 : 1;
  return Math.max(10, Math.round(questionCount * perQuestionMinutes));
}

/**
 * Resolves a `/test/[testId]` route against the hardcoded mock catalog
 * first, then falls back to a Supabase `exams` row published via the
 * admin AI generator — so a freshly-generated test is immediately
 * playable, not just previewable. Wrapped in React's `cache()` so
 * `generateMetadata` and the page body share a single lookup per request.
 */
export const resolveTest = cache(
  async (testId: string): Promise<ResolvedTest | null> => {
    const mockLookup = getExamById(testId);
    if (mockLookup) {
      const { exam, subjectSlug } = mockLookup;
      const subject = getSubjectBySlug(subjectSlug);
      if (!subject || exam.status === "locked") return null;

      const questions = getQuestionsForSubject(subjectSlug).slice(
        0,
        exam.questionCount,
      );
      if (questions.length === 0) return null;

      return {
        examId: exam.id,
        examTitle: exam.title,
        difficulty: exam.difficulty,
        durationMinutes: exam.durationMinutes,
        questions,
        subject: {
          slug: subject.slug,
          name: subject.name,
          accent: subject.accent,
        },
      };
    }

    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, subject, difficulty, questions")
        .eq("id", testId)
        .single();

      if (error || !data) return null;

      const questions = Array.isArray(data.questions)
        ? data.questions.filter(isApiQuestion)
        : [];
      if (questions.length === 0) return null;

      const difficulty = (
        DIFFICULTY_LEVELS as readonly string[]
      ).includes(data.difficulty)
        ? (data.difficulty as DifficultyLevel)
        : "Medium";

      return {
        examId: data.id,
        examTitle: data.title,
        difficulty,
        durationMinutes: estimateDurationMinutes(questions.length, difficulty),
        questions,
        subject: resolveSubjectMeta(data.subject),
      };
    } catch (error) {
      console.error("[resolve-test] Failed to load published exam:", error);
      return null;
    }
  },
);
