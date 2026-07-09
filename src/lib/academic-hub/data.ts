import type { createClient } from "@/utils/supabase/server";
import type {
  Assignment,
  AssignmentSubmission,
  ScheduleEntry,
  ScheduleEventType,
} from "@/lib/academic-hub/types";

type ServerSupabaseClient = ReturnType<typeof createClient>;

interface ScheduleRow {
  id: string;
  title: string;
  subject: string;
  event_type: ScheduleEventType;
  batch: string | null;
  starts_at: string;
  ends_at: string;
  join_url: string | null;
  notes: string;
}

/** Every upcoming schedule entry visible to `myBatch` (or everyone, for a
 * null-batch entry), soonest first. Shared by /student/schedule and the
 * home gateway's student view so both fetch it identically. */
export async function getUpcomingSchedule(
  supabase: ServerSupabaseClient,
  myBatch: string | null,
  limit?: number,
): Promise<ScheduleEntry[]> {
  let query = supabase
    .from("class_schedule")
    .select("id, title, subject, event_type, batch, starts_at, ends_at, join_url, notes")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (limit) query = query.limit(limit * 4);

  const { data } = await query;

  const entries: ScheduleEntry[] = ((data ?? []) as ScheduleRow[])
    .filter((row) => !row.batch || row.batch === myBatch)
    .map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      eventType: row.event_type,
      batch: row.batch,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      joinUrl: row.join_url,
      notes: row.notes,
    }));

  return limit ? entries.slice(0, limit) : entries;
}

interface AssignmentRow {
  id: string;
  title: string;
  description: string;
  subject: string;
  batch: string | null;
  due_at: string;
  created_at: string;
}

interface SubmissionRow {
  id: string;
  assignment_id: string;
  student_id: string;
  response_text: string;
  response_url: string | null;
  status: "submitted" | "graded";
  grade: string | null;
  feedback: string | null;
  submitted_at: string;
}

export interface AssignmentsWithSubmissions {
  assignments: Assignment[];
  submissionsByAssignmentId: Record<string, AssignmentSubmission>;
}

/** Every assignment visible to `myBatch`, plus this student's own
 * submissions keyed by assignment id. Shared by /student/assignments and
 * the home gateway's student view. */
export async function getAssignmentsWithSubmissions(
  supabase: ServerSupabaseClient,
  studentId: string,
  myBatch: string | null,
): Promise<AssignmentsWithSubmissions> {
  const [{ data: assignmentRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, description, subject, batch, due_at, created_at")
      .order("due_at", { ascending: true }),
    supabase
      .from("assignment_submissions")
      .select(
        "id, assignment_id, student_id, response_text, response_url, status, grade, feedback, submitted_at",
      )
      .eq("student_id", studentId),
  ]);

  const assignments: Assignment[] = ((assignmentRows ?? []) as AssignmentRow[])
    .filter((row) => !row.batch || row.batch === myBatch)
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      subject: row.subject,
      batch: row.batch,
      dueAt: row.due_at,
      createdAt: row.created_at,
    }));

  const submissionsByAssignmentId: Record<string, AssignmentSubmission> = Object.fromEntries(
    ((submissionRows ?? []) as SubmissionRow[]).map((row) => [
      row.assignment_id,
      {
        id: row.id,
        assignmentId: row.assignment_id,
        studentId: row.student_id,
        responseText: row.response_text,
        responseUrl: row.response_url,
        status: row.status,
        grade: row.grade,
        feedback: row.feedback,
        submittedAt: row.submitted_at,
      },
    ]),
  );

  return { assignments, submissionsByAssignmentId };
}
