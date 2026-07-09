"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import type { Assignment } from "@/lib/academic-hub/types";

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

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; assignments: Assignment[] };

function rowToAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    batch: row.batch,
    dueAt: row.due_at,
    createdAt: row.created_at,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SubmissionsListProps {
  assignmentId: string;
  supabase: ReturnType<typeof createClient>;
}

function SubmissionsList({ assignmentId, supabase }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<SubmissionRow[] | null>(null);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from("assignment_submissions")
        .select(
          "id, assignment_id, student_id, response_text, response_url, status, grade, feedback, submitted_at",
        )
        .eq("assignment_id", assignmentId)
        .order("submitted_at", { ascending: false });

      const rows = (data ?? []) as SubmissionRow[];
      setSubmissions(rows);
      setGradeDrafts(
        Object.fromEntries(
          rows.map((row) => [row.id, { grade: row.grade ?? "", feedback: row.feedback ?? "" }]),
        ),
      );

      const studentIds = [...new Set(rows.map((row) => row.student_id))];
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);
        setStudentNames(
          Object.fromEntries(
            (profiles ?? []).map((profile) => [
              profile.id,
              profile.full_name || profile.email,
            ]),
          ),
        );
      }
    };
    void run();
  }, [assignmentId, supabase]);

  const saveGrade = async (submissionId: string) => {
    const draft = gradeDrafts[submissionId];
    if (!draft) return;
    setSavingId(submissionId);
    const { error } = await supabase
      .from("assignment_submissions")
      .update({ grade: draft.grade.trim() || null, feedback: draft.feedback.trim() || null, status: "graded" })
      .eq("id", submissionId);
    setSavingId(null);
    if (!error) {
      setSubmissions(
        (current) =>
          current?.map((row) =>
            row.id === submissionId
              ? { ...row, grade: draft.grade.trim() || null, feedback: draft.feedback.trim() || null, status: "graded" }
              : row,
          ) ?? null,
      );
    }
  };

  if (submissions === null) {
    return <div className="p-4 text-xs text-slate-500">Loading submissions…</div>;
  }

  if (submissions.length === 0) {
    return <div className="p-4 text-xs text-slate-500">No submissions yet.</div>;
  }

  return (
    <div className="space-y-3 border-t border-slate-800 p-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">
              {studentNames[submission.student_id] || submission.student_id}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                submission.status === "graded"
                  ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30"
              }`}
            >
              {submission.status === "graded" ? "Graded" : "Submitted"}
            </span>
          </div>
          {submission.response_text && (
            <p className="mt-2 text-sm text-slate-400">{submission.response_text}</p>
          )}
          {submission.response_url && (
            <a
              href={submission.response_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              <ExternalLink className="h-3 w-3" />
              {submission.response_url}
            </a>
          )}

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr_auto]">
            <input
              type="text"
              value={gradeDrafts[submission.id]?.grade ?? ""}
              onChange={(event) =>
                setGradeDrafts((current) => ({
                  ...current,
                  [submission.id]: { ...current[submission.id], grade: event.target.value },
                }))
              }
              placeholder="Grade"
              className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/60"
            />
            <input
              type="text"
              value={gradeDrafts[submission.id]?.feedback ?? ""}
              onChange={(event) =>
                setGradeDrafts((current) => ({
                  ...current,
                  [submission.id]: { ...current[submission.id], feedback: event.target.value },
                }))
              }
              placeholder="Feedback (optional)"
              className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/60"
            />
            <button
              type="button"
              onClick={() => void saveGrade(submission.id)}
              disabled={savingId === submission.id}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-60"
            >
              {savingId === submission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Grade"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssignmentsPanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const { data, error } = await supabase
      .from("assignments")
      .select("id, title, description, subject, batch, due_at, created_at")
      .order("due_at", { ascending: true });

    if (error || !data) {
      setState({ status: "ready", assignments: [] });
      return;
    }

    setState({ status: "ready", assignments: (data as AssignmentRow[]).map(rowToAssignment) });
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setFormError(null);

    if (!title.trim() || !subject.trim() || !dueAt) {
      setFormError("Title, subject, and due date are required.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("assignments").insert({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      batch: batch.trim() || null,
      due_at: new Date(dueAt).toISOString(),
    });
    setIsSaving(false);

    if (error) {
      setFormError("Couldn't save this assignment. Make sure you're signed in as an admin.");
      return;
    }

    setTitle("");
    setDescription("");
    setSubject("");
    setBatch("");
    setDueAt("");
    void load();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    setDeletingId(id);
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    setDeletingId(null);
    if (!error) void load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30">
            <ClipboardList className="h-5 w-5 text-violet-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Assignments</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create homework, then grade student submissions as they come in.
            </p>
          </div>
        </div>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so assignments can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="card-glow relative space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
      >
        <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assign-title" className="text-sm font-medium text-slate-300">Title</label>
            <input
              id="assign-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Chapter 4 Problem Set"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label htmlFor="assign-subject" className="text-sm font-medium text-slate-300">Subject</label>
            <input
              id="assign-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Mathematics"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label htmlFor="assign-batch" className="text-sm font-medium text-slate-300">
              Batch <span className="text-slate-600">(optional)</span>
            </label>
            <input
              id="assign-batch"
              type="text"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="e.g. Batch A"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label htmlFor="assign-due" className="text-sm font-medium text-slate-300">Due</label>
            <input
              id="assign-due"
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="assign-desc" className="text-sm font-medium text-slate-300">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              id="assign-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        {formError && (
          <p className="flex items-center gap-2 text-sm text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !supabase}
          className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] transition-all hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Assign Homework
        </button>
      </form>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />

        {state.status === "loading" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "ready" && state.assignments.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No assignments yet — create one above.</p>
        )}

        {state.status === "ready" &&
          state.assignments.map((assignment) => (
            <div key={assignment.id} className="border-b border-slate-800/60 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{assignment.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {assignment.subject} · Due {formatDate(assignment.dueAt)}
                    {assignment.batch ? ` · ${assignment.batch}` : " · All batches"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId((current) => (current === assignment.id ? null : assignment.id))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-violet-500/50 hover:text-violet-300"
                  >
                    {expandedId === assignment.id ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    Submissions
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(assignment.id)}
                    disabled={deletingId === assignment.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
                  >
                    {deletingId === assignment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {expandedId === assignment.id && supabase && (
                <SubmissionsList assignmentId={assignment.id} supabase={supabase} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
