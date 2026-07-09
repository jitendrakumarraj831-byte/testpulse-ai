import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { StudentAssignmentsView } from "@/components/student/StudentAssignmentsView";
import type { Assignment, AssignmentSubmission } from "@/lib/academic-hub/types";

export const metadata: Metadata = {
  title: "Assignments | TestPulse AI",
  description: "Submit your homework and check grades as they come in.",
};

export const dynamic = "force-dynamic";

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

export default async function StudentAssignmentsPage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/assignments");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/assignments");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("batch")
    .eq("id", user.id)
    .maybeSingle();

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
      .eq("student_id", user.id),
  ]);

  const myBatch = profile?.batch ?? null;
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

  return (
    <StudentAssignmentsView
      studentId={user.id}
      assignments={assignments}
      submissionsByAssignmentId={submissionsByAssignmentId}
    />
  );
}
