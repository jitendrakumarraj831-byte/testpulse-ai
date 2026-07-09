"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Info, UserCog } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resolveExamInfo } from "@/lib/student/exam-info";
import { computeStreakSummary } from "@/lib/student/streak";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface StudentRow {
  key: string;
  name: string;
  joinedAt: string;
  lastActiveAt: string;
  totalAttempts: number;
  averageAccuracy: number;
  currentStreak: number;
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; students: StudentRow[] };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function accuracyTone(percent: number): string {
  if (percent >= 70) return "text-emerald-400";
  if (percent >= 40) return "text-amber-400";
  return "text-rose-400";
}

export function StudentDirectory() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const { data, error } = await client
        .from("leaderboard_entries")
        .select("id, exam_id, student_name, score, submitted_at")
        .order("submitted_at", { ascending: true })
        .limit(500);

      if (error || !data) {
        setState({ status: "ready", students: [] });
        return;
      }

      const examIds = [...new Set(data.map((row) => row.exam_id))];
      const examInfo = await resolveExamInfo(examIds);

      const byStudent = new Map<
        string,
        { name: string; rows: typeof data }
      >();
      for (const row of data) {
        const key = row.student_name.trim().toLowerCase();
        const group = byStudent.get(key);
        if (group) {
          group.rows.push(row);
        } else {
          byStudent.set(key, { name: row.student_name, rows: [row] });
        }
      }

      const students: StudentRow[] = [...byStudent.entries()].map(([key, group]) => {
        const rows = [...group.rows].sort(
          (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
        );
        const summary = computeStreakSummary(rows, examInfo);

        return {
          key,
          name: group.name,
          joinedAt: rows[0].submitted_at,
          lastActiveAt: rows[rows.length - 1].submitted_at,
          totalAttempts: rows.length,
          averageAccuracy: summary.averageAccuracy,
          currentStreak: summary.currentStreak,
        };
      });

      students.sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
      );

      setState({ status: "ready", students });
    };

    void run();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <UserCog className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">
              Manage Students
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Every student who has submitted a test, computed live from real
              submission history.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-3 text-sm text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p>
            This directory is read-only. Adding, deleting, resetting
            passwords, or suspending students needs a real login system —
            today every test is taken anonymously by name, with no accounts
            to manage yet. That&apos;s the next foundational piece, not a UI gap.
          </p>
        </div>
      </motion.div>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />

        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Student</span>
          <span>Joined</span>
          <span>Attempts</span>
          <span>Accuracy</span>
          <span>Streak</span>
        </div>

        {state.status !== "ready" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "unconfigured" && (
          <p className="p-6 text-sm text-slate-500">
            Supabase isn&apos;t configured in this environment, so the
            directory can&apos;t load — expected in local/preview setups
            without env vars set.
          </p>
        )}

        {state.status === "ready" && state.students.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No students yet — once someone submits a test, they&apos;ll show
            up here.
          </p>
        )}

        {state.status === "ready" &&
          state.students.map((student, index) => {
            const initial = student.name.trim().charAt(0).toUpperCase() || "?";
            return (
              <motion.div
                key={student.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
                className="grid grid-cols-2 items-center gap-4 border-b border-slate-800/60 px-6 py-4 last:border-0 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
              >
                <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/30">
                    {initial}
                  </span>
                  <p className="truncate text-sm font-semibold text-white">
                    {student.name}
                  </p>
                </div>

                <p className="text-sm text-slate-400">{formatDate(student.joinedAt)}</p>

                <p className="text-sm font-medium text-slate-300">
                  {student.totalAttempts}
                </p>

                <p className={`text-sm font-bold ${accuracyTone(student.averageAccuracy)}`}>
                  {student.averageAccuracy}%
                </p>

                <div className="flex items-center gap-1.5">
                  <Flame
                    className={`h-3.5 w-3.5 ${
                      student.currentStreak > 0 ? "text-amber-400" : "text-slate-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      student.currentStreak > 0 ? "text-amber-300" : "text-slate-500"
                    }`}
                  >
                    {student.currentStreak}d
                  </span>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
