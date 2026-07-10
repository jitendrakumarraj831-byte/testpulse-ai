import type { createClient } from "@/utils/supabase/client";
import { resolveExamInfo } from "@/lib/student/exam-info";

type SupabaseClient = ReturnType<typeof createClient>;

export interface SubjectPerformance {
  subjectName: string;
  attempts: number;
  averageAccuracy: number;
}

export interface ExamPerformanceSummary {
  totalAttempts: number;
  overallAccuracy: number;
  bySubject: SubjectPerformance[];
}

export interface AttendanceSummary {
  totalDaysMarked: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export type AssignmentReportStatus = "graded" | "submitted" | "missing" | "pending";

export interface AssignmentRecord {
  id: string;
  title: string;
  subject: string;
  dueAt: string;
  status: AssignmentReportStatus;
  grade: string | null;
  feedback: string | null;
}

export interface ReportCardData {
  studentId: string;
  studentName: string;
  batch: string | null;
  generatedAt: string;
  examPerformance: ExamPerformanceSummary;
  attendance: AttendanceSummary;
  assignments: AssignmentRecord[];
}

interface StudentResponseRow {
  exam_id: string;
  score: number | null;
  submitted_at: string;
}

interface AttendanceRow {
  status: "present" | "absent" | "late";
}

interface AssignmentRow {
  id: string;
  title: string;
  subject: string;
  batch: string | null;
  due_at: string;
}

interface SubmissionRow {
  assignment_id: string;
  status: "submitted" | "graded";
  grade: string | null;
  feedback: string | null;
}

function emptyExamPerformance(): ExamPerformanceSummary {
  return { totalAttempts: 0, overallAccuracy: 0, bySubject: [] };
}

async function loadExamPerformance(
  supabase: SupabaseClient,
  studentId: string,
): Promise<ExamPerformanceSummary> {
  const { data, error } = await supabase
    .from("student_responses")
    .select("exam_id, score, submitted_at")
    .eq("student_id", studentId);

  if (error || !data || data.length === 0) return emptyExamPerformance();

  const rows = data as StudentResponseRow[];
  const examIds = [...new Set(rows.map((row) => row.exam_id))];
  const examInfo = await resolveExamInfo(examIds);

  const accuracyBySubject = new Map<string, number[]>();
  const allAccuracies: number[] = [];

  for (const row of rows) {
    const info = examInfo[row.exam_id];
    if (!info || info.totalQuestions <= 0) continue;
    const accuracy = Math.round((Number(row.score ?? 0) / info.totalQuestions) * 100);
    allAccuracies.push(accuracy);
    const bucket = accuracyBySubject.get(info.subjectName) ?? [];
    bucket.push(accuracy);
    accuracyBySubject.set(info.subjectName, bucket);
  }

  const bySubject: SubjectPerformance[] = [...accuracyBySubject.entries()]
    .map(([subjectName, accuracies]) => ({
      subjectName,
      attempts: accuracies.length,
      averageAccuracy: Math.round(accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length),
    }))
    .sort((a, b) => b.attempts - a.attempts);

  const overallAccuracy =
    allAccuracies.length > 0
      ? Math.round(allAccuracies.reduce((sum, value) => sum + value, 0) / allAccuracies.length)
      : 0;

  return { totalAttempts: rows.length, overallAccuracy, bySubject };
}

async function loadAttendance(
  supabase: SupabaseClient,
  studentId: string,
): Promise<AttendanceSummary> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId);

  if (error || !data) {
    return { totalDaysMarked: 0, presentCount: 0, lateCount: 0, absentCount: 0, attendanceRate: 0 };
  }

  const rows = data as AttendanceRow[];
  const presentCount = rows.filter((row) => row.status === "present").length;
  const lateCount = rows.filter((row) => row.status === "late").length;
  const absentCount = rows.filter((row) => row.status === "absent").length;
  const totalDaysMarked = rows.length;
  const attendanceRate =
    totalDaysMarked > 0 ? Math.round(((presentCount + lateCount) / totalDaysMarked) * 100) : 0;

  return { totalDaysMarked, presentCount, lateCount, absentCount, attendanceRate };
}

async function loadAssignments(
  supabase: SupabaseClient,
  studentId: string,
  batch: string | null,
): Promise<AssignmentRecord[]> {
  const [{ data: assignmentRows, error: assignmentError }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, subject, batch, due_at")
      .order("due_at", { ascending: false }),
    supabase
      .from("assignment_submissions")
      .select("assignment_id, status, grade, feedback")
      .eq("student_id", studentId),
  ]);

  if (assignmentError || !assignmentRows) return [];

  const relevant = (assignmentRows as AssignmentRow[]).filter(
    (assignment) => !assignment.batch || assignment.batch === batch,
  );

  const submissionByAssignment = new Map<string, SubmissionRow>(
    ((submissionRows ?? []) as SubmissionRow[]).map((row) => [row.assignment_id, row]),
  );

  const now = Date.now();

  return relevant.map((assignment) => {
    const submission = submissionByAssignment.get(assignment.id);
    const status: AssignmentReportStatus = submission
      ? submission.status
      : new Date(assignment.due_at).getTime() < now
        ? "missing"
        : "pending";

    return {
      id: assignment.id,
      title: assignment.title,
      subject: assignment.subject,
      dueAt: assignment.due_at,
      status,
      grade: submission?.grade ?? null,
      feedback: submission?.feedback ?? null,
    };
  });
}

/** Aggregates a single student's real exam scores, attendance, and
 * assignment grades into one report — the data source for the admin
 * "Report Cards" tool (Module 4.3). Every figure is computed fresh from
 * the same tables the rest of the app reads/writes (student_responses,
 * attendance_records, assignments/assignment_submissions); nothing here is
 * a separate, driftable snapshot. */
export async function getReportCardData(
  supabase: SupabaseClient,
  studentId: string,
  studentName: string,
  batch: string | null,
): Promise<ReportCardData> {
  const [examPerformance, attendance, assignments] = await Promise.all([
    loadExamPerformance(supabase, studentId),
    loadAttendance(supabase, studentId),
    loadAssignments(supabase, studentId, batch),
  ]);

  return {
    studentId,
    studentName,
    batch,
    generatedAt: new Date().toISOString(),
    examPerformance,
    attendance,
    assignments,
  };
}
