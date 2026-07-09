import type { OptionLabel } from "@/lib/admin/question-generator";

/** Matches the JSONB shape of the `answers` column on `student_responses`. */
export type StudentAnswers = Record<number, OptionLabel>;

/** Row shape inserted into `student_responses` (id/submitted_at are server-defaulted). */
export interface StudentResponseInsert {
  exam_id: string;
  student_name: string;
  /** The signed-in user's id, when a session exists — null for anonymous/logged-out submissions. */
  student_id: string | null;
  answers: StudentAnswers;
  score: number;
}
