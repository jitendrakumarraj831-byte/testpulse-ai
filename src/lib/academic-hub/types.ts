export type ScheduleEventType = "class" | "exam" | "event";

export interface ScheduleEntry {
  id: string;
  title: string;
  subject: string;
  eventType: ScheduleEventType;
  batch: string | null;
  startsAt: string;
  endsAt: string;
  joinUrl: string | null;
  notes: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  batch: string | null;
  dueAt: string;
  createdAt: string;
}

export type SubmissionStatus = "submitted" | "graded";

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  responseText: string;
  responseUrl: string | null;
  status: SubmissionStatus;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
}

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  batch: string | null;
}
