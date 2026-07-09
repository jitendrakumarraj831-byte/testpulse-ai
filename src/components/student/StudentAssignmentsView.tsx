"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Assignment, AssignmentSubmission } from "@/lib/academic-hub/types";

interface StudentAssignmentsViewProps {
  studentId: string;
  assignments: Assignment[];
  submissionsByAssignmentId: Record<string, AssignmentSubmission>;
}

function formatDue(iso: string): string {
  const due = new Date(iso);
  const isPast = due.getTime() < Date.now();
  const label = due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return isPast ? `Was due ${label}` : `Due ${label}`;
}

function AssignmentCard({
  assignment,
  submission,
  studentId,
  onSubmitted,
}: {
  assignment: Assignment;
  submission: AssignmentSubmission | undefined;
  studentId: string;
  onSubmitted: (submission: AssignmentSubmission) => void;
}) {
  const [responseText, setResponseText] = useState(submission?.responseText ?? "");
  const [responseUrl, setResponseUrl] = useState(submission?.responseUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!responseText.trim() && !responseUrl.trim()) {
      setError("Add a response or a link before submitting.");
      return;
    }
    setError(null);
    setIsSaving(true);

    const supabase = createClient();
    const { data, error: submitError } = await supabase
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: assignment.id,
          student_id: studentId,
          response_text: responseText.trim(),
          response_url: responseUrl.trim() || null,
        },
        { onConflict: "assignment_id,student_id" },
      )
      .select("id, assignment_id, student_id, response_text, response_url, status, grade, feedback, submitted_at")
      .single();

    setIsSaving(false);

    if (submitError || !data) {
      setError("Couldn't submit your work. Please try again.");
      return;
    }

    onSubmitted({
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      responseText: data.response_text,
      responseUrl: data.response_url,
      status: data.status,
      grade: data.grade,
      feedback: data.feedback,
      submittedAt: data.submitted_at,
    });
  };

  const isGraded = submission?.status === "graded";

  return (
    <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            {assignment.subject}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">{assignment.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{formatDue(assignment.dueAt)}</p>
        </div>
        {submission && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isGraded
                ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30"
            }`}
          >
            {isGraded ? <CheckCircle2 className="h-3 w-3" /> : null}
            {isGraded ? `Graded${submission.grade ? `: ${submission.grade}` : ""}` : "Submitted"}
          </span>
        )}
      </div>

      {assignment.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{assignment.description}</p>
      )}

      {isGraded && submission.feedback && (
        <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-200">
          {submission.feedback}
        </p>
      )}

      {!isGraded && (
        <div className="mt-4 space-y-3">
          <textarea
            value={responseText}
            onChange={(event) => setResponseText(event.target.value)}
            placeholder="Type your answer here…"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
          <input
            type="url"
            value={responseUrl}
            onChange={(event) => setResponseUrl(event.target.value)}
            placeholder="Or paste a link (Google Drive, etc.) — optional"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
          {error && (
            <p className="flex items-center gap-2 text-sm text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] transition-all hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {submission ? "Update Submission" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentAssignmentsView({
  studentId,
  assignments,
  submissionsByAssignmentId,
}: StudentAssignmentsViewProps) {
  const [submissions, setSubmissions] = useState(submissionsByAssignmentId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          <ClipboardList className="h-3.5 w-3.5" />
          Homework
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Assignments
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Submit your work and check grades as they come in.
        </p>
      </motion.div>

      {assignments.length === 0 && (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
          No assignments yet — check back once your institute publishes homework.
        </p>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            submission={submissions[assignment.id]}
            studentId={studentId}
            onSubmitted={(submission) =>
              setSubmissions((current) => ({ ...current, [assignment.id]: submission }))
            }
          />
        ))}
      </div>
    </div>
  );
}
