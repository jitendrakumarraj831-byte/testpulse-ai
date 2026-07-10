"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  FileBadge,
  Loader2,
  Printer,
  Search,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import {
  getReportCardData,
  type AssignmentReportStatus,
  type ReportCardData,
} from "@/lib/report-card/data";

interface StudentOption {
  id: string;
  fullName: string;
  email: string;
  batch: string | null;
}

type DirectoryState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; students: StudentOption[] };

type ReportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: ReportCardData };

const ASSIGNMENT_STATUS_META: Record<AssignmentReportStatus, { label: string; className: string }> = {
  graded: { label: "Graded", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  submitted: { label: "Submitted", className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
  pending: { label: "Pending", className: "border-slate-700 bg-slate-800/40 text-slate-400" },
  missing: { label: "Missing", className: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ReportCardPanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [directory, setDirectory] = useState<DirectoryState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StudentOption | null>(null);
  const [report, setReport] = useState<ReportState>({ status: "idle" });

  useEffect(() => {
    if (!supabase) {
      setDirectory({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, batch")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      if (error || !data) {
        setDirectory({ status: "ready", students: [] });
        return;
      }

      setDirectory({
        status: "ready",
        students: data.map((row) => ({
          id: row.id,
          fullName: row.full_name || row.email,
          email: row.email,
          batch: row.batch,
        })),
      });
    };
    void run();
  }, [supabase]);

  const visibleStudents =
    directory.status === "ready"
      ? directory.students.filter((student) => {
          const needle = query.trim().toLowerCase();
          if (!needle) return true;
          return (
            student.fullName.toLowerCase().includes(needle) ||
            student.email.toLowerCase().includes(needle)
          );
        })
      : [];

  const selectStudent = async (student: StudentOption) => {
    if (!supabase) return;
    setSelected(student);
    setReport({ status: "loading" });
    const data = await getReportCardData(supabase, student.id, student.fullName, student.batch);
    setReport({ status: "ready", data });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-8 print:px-0 print:py-0">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="print:hidden"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <FileBadge className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Report Cards</h1>
            <p className="mt-1 text-sm text-slate-500">
              Real exam scores, attendance, and assignment grades, aggregated per student.
            </p>
          </div>
        </div>
      </motion.div>

      {directory.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500 print:hidden">
          Supabase isn&apos;t configured in this environment, so report cards can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      {directory.status !== "unconfigured" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md print:hidden">
            <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />
            <div className="border-b border-slate-800 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search students…"
                  className="w-full rounded-full border border-slate-700 bg-slate-950/60 py-2 pr-3 pl-9 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {directory.status === "loading" && (
                <div className="space-y-2 p-4">
                  <div className="h-12 animate-pulse rounded-xl bg-slate-800/50" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-800/50" />
                </div>
              )}

              {directory.status === "ready" && visibleStudents.length === 0 && (
                <p className="p-4 text-sm text-slate-500">No matching students.</p>
              )}

              {directory.status === "ready" &&
                visibleStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => void selectStudent(student)}
                    className={`flex w-full items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5 ${
                      selected?.id === student.id ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300 ring-1 ring-cyan-500/30">
                      {student.fullName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{student.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{student.batch || "No batch set"}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-6">
            {report.status === "idle" && (
              <div className="card-glow flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-md print:hidden">
                <p className="text-sm text-slate-500">
                  Select a student from the list to generate their report card.
                </p>
              </div>
            )}

            {report.status === "loading" && (
              <div className="card-glow flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            )}

            {report.status === "ready" && (
              <div className="print:text-black">
                <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md print:border-slate-300 print:bg-white sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 print:text-black">
                        TestPulse AI — Student Report Card
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-white print:text-black">
                        {report.data.studentName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 print:text-slate-600">
                        {report.data.batch || "No batch set"} · Generated {formatDate(report.data.generatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 print:hidden"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print / Save as PDF
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 print:border-slate-300 print:bg-white">
                      <div className="flex items-center gap-2 text-amber-400 print:text-black">
                        <BarChart3 className="h-4 w-4" />
                        <p className="text-xs font-semibold uppercase tracking-widest">Exam Arena</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white print:text-black">
                        {report.data.examPerformance.overallAccuracy}%
                      </p>
                      <p className="text-xs text-slate-500 print:text-slate-600">
                        Overall accuracy · {report.data.examPerformance.totalAttempts} exam
                        {report.data.examPerformance.totalAttempts === 1 ? "" : "s"} taken
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 print:border-slate-300 print:bg-white">
                      <div className="flex items-center gap-2 text-emerald-400 print:text-black">
                        <CalendarCheck className="h-4 w-4" />
                        <p className="text-xs font-semibold uppercase tracking-widest">Attendance</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white print:text-black">
                        {report.data.attendance.attendanceRate}%
                      </p>
                      <p className="text-xs text-slate-500 print:text-slate-600">
                        {report.data.attendance.presentCount} present · {report.data.attendance.lateCount} late ·{" "}
                        {report.data.attendance.absentCount} absent
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 print:border-slate-300 print:bg-white">
                      <div className="flex items-center gap-2 text-violet-400 print:text-black">
                        <ClipboardList className="h-4 w-4" />
                        <p className="text-xs font-semibold uppercase tracking-widest">Homework</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white print:text-black">
                        {report.data.assignments.filter((assignment) => assignment.status === "graded").length}/
                        {report.data.assignments.length}
                      </p>
                      <p className="text-xs text-slate-500 print:text-slate-600">Assignments graded</p>
                    </div>
                  </div>

                  {report.data.examPerformance.bySubject.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 print:text-slate-600">
                        Accuracy by subject
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {report.data.examPerformance.bySubject.map((subject) => (
                          <div key={subject.subjectName}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-300 print:text-black">
                                {subject.subjectName}{" "}
                                <span className="text-slate-600 print:text-slate-500">
                                  ({subject.attempts} attempt{subject.attempts === 1 ? "" : "s"})
                                </span>
                              </span>
                              <span className="font-semibold text-slate-300 print:text-black">
                                {subject.averageAccuracy}%
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800 print:bg-slate-200">
                              <div
                                className="h-full rounded-full bg-cyan-500"
                                style={{ width: `${Math.min(100, subject.averageAccuracy)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 print:text-slate-600">
                      Assignments
                    </p>
                    {report.data.assignments.length === 0 && (
                      <p className="mt-2 text-sm text-slate-500 print:text-slate-600">
                        No assignments issued to this student&apos;s batch yet.
                      </p>
                    )}
                    <div className="mt-3 space-y-2">
                      {report.data.assignments.map((assignment) => {
                        const meta = ASSIGNMENT_STATUS_META[assignment.status];
                        return (
                          <div
                            key={assignment.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 print:border-slate-300 print:bg-white"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white print:text-black">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-slate-500 print:text-slate-600">
                                {assignment.subject} · Due {formatDate(assignment.dueAt)}
                                {assignment.grade ? ` · Grade: ${assignment.grade}` : ""}
                              </p>
                            </div>
                            <span
                              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold print:border-slate-400 print:bg-transparent print:text-black ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {report.status === "ready" &&
              report.data.examPerformance.totalAttempts === 0 &&
              report.data.attendance.totalDaysMarked === 0 &&
              report.data.assignments.length === 0 && (
                <p className="flex items-center gap-2 text-xs text-slate-500 print:hidden">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  This student has no recorded exams, attendance, or assignments yet.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
