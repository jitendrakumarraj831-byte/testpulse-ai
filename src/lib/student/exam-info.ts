import { supabase } from "@/lib/supabase";
import { getExamById } from "@/lib/student/exams";
import { getSubjectBySlug, SUBJECTS } from "@/lib/student/subjects";

export interface ExamInfo {
  subjectSlug: string;
  subjectName: string;
  totalQuestions: number;
}

/** Resolves subject + question-count metadata for a batch of exam_ids, checking the hardcoded mock catalog first and falling back to a real `exams` row lookup for anything unresolved (e.g. AI-generated exams published via the uploader). Safe to call from both server and client code — `supabase` is the anon-key singleton. */
export async function resolveExamInfo(
  examIds: string[],
): Promise<Record<string, ExamInfo>> {
  const resolved: Record<string, ExamInfo> = {};
  const unresolved: string[] = [];

  for (const examId of examIds) {
    const lookup = getExamById(examId);
    if (lookup) {
      const subject = getSubjectBySlug(lookup.subjectSlug);
      resolved[examId] = {
        subjectSlug: lookup.subjectSlug,
        subjectName: subject?.name ?? lookup.subjectSlug,
        totalQuestions: lookup.exam.questionCount,
      };
    } else {
      unresolved.push(examId);
    }
  }

  if (unresolved.length > 0 && supabase) {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, subject, questions")
        .in("id", unresolved);

      if (error) throw error;

      for (const row of data ?? []) {
        const subjectSlug =
          SUBJECTS.find(
            (candidate) =>
              candidate.name.toLowerCase() === String(row.subject).toLowerCase(),
          )?.slug ?? "unknown";
        resolved[row.id] = {
          subjectSlug,
          subjectName: row.subject,
          totalQuestions: Array.isArray(row.questions) ? row.questions.length : 0,
        };
      }
    } catch (error) {
      console.error("[exam-info] Failed to resolve published exams:", error);
    }
  }

  return resolved;
}
