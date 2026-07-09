"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Loader2, X } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import type { AttendanceStatus } from "@/lib/academic-hub/types";

interface StudentRow {
  id: string;
  fullName: string;
  email: string;
  batch: string | null;
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; students: StudentRow[] };

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_META: Record<AttendanceStatus, { label: string; active: string }> = {
  present: { label: "Present", active: "bg-emerald-500 text-slate-950" },
  late: { label: "Late", active: "bg-amber-500 text-slate-950" },
  absent: { label: "Absent", active: "bg-rose-500 text-slate-950" },
};

export function AttendancePanel() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [date, setDate] = useState(todayIsoDate());
  const [batchFilter, setBatchFilter] = useState("all");
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, batch")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      if (error || !data) {
        setState({ status: "ready", students: [] });
        return;
      }

      setState({
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

  useEffect(() => {
    if (!supabase) return;

    const run = async () => {
      const { data } = await supabase
        .from("attendance_records")
        .select("student_id, status")
        .eq("attendance_date", date);

      setRecords(
        Object.fromEntries((data ?? []).map((row) => [row.student_id, row.status as AttendanceStatus])),
      );
    };
    void run();
  }, [supabase, date]);

  const mark = async (studentId: string, status: AttendanceStatus, batch: string | null) => {
    if (!supabase) return;
    setSavingId(studentId);

    const { error } = await supabase
      .from("attendance_records")
      .upsert(
        { student_id: studentId, attendance_date: date, status, batch },
        { onConflict: "student_id,attendance_date" },
      );

    setSavingId(null);
    if (!error) {
      setRecords((current) => ({ ...current, [studentId]: status }));
    }
  };

  const batches =
    state.status === "ready"
      ? [...new Set(state.students.map((student) => student.batch).filter((batch): batch is string => Boolean(batch)))]
      : [];

  const visibleStudents =
    state.status === "ready"
      ? state.students.filter((student) => batchFilter === "all" || student.batch === batchFilter)
      : [];

  const presentCount = visibleStudents.filter((student) => records[student.id] === "present").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Mark attendance per day — every tap saves immediately.
            </p>
          </div>
        </div>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so attendance can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
        />
        <select
          value={batchFilter}
          onChange={(event) => setBatchFilter(event.target.value)}
          className="appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all" className="bg-slate-900">All batches</option>
          {batches.map((batch) => (
            <option key={batch} value={batch} className="bg-slate-900">
              {batch}
            </option>
          ))}
        </select>
        {state.status === "ready" && visibleStudents.length > 0 && (
          <span className="text-sm text-slate-500">
            {presentCount}/{visibleStudents.length} present
          </span>
        )}
      </div>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-emerald-400/50" alwaysVisible />

        {state.status === "loading" && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {state.status === "ready" && visibleStudents.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No registered students{batchFilter !== "all" ? " in this batch" : ""} yet.
          </p>
        )}

        {state.status === "ready" &&
          visibleStudents.map((student) => {
            const current = records[student.id];
            const isSaving = savingId === student.id;
            return (
              <div
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{student.fullName}</p>
                  <p className="text-xs text-slate-500">{student.batch || "No batch set"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                  {(["present", "late", "absent"] as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={isSaving}
                      onClick={() => void mark(student.id, status, student.batch)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        current === status
                          ? STATUS_META[status].active
                          : "border border-slate-700 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {STATUS_META[status].label}
                    </button>
                  ))}
                  {current && (
                    <button
                      type="button"
                      title="Clear"
                      disabled={isSaving}
                      onClick={async () => {
                        if (!supabase) return;
                        setSavingId(student.id);
                        const { error } = await supabase
                          .from("attendance_records")
                          .delete()
                          .eq("student_id", student.id)
                          .eq("attendance_date", date);
                        setSavingId(null);
                        if (!error) {
                          setRecords((prev) => {
                            const next = { ...prev };
                            delete next[student.id];
                            return next;
                          });
                        }
                      }}
                      className="rounded-full p-1.5 text-slate-600 hover:text-rose-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
