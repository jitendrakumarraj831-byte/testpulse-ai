"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Trash2,
  UserCog,
  UserMinus,
  UserCheck,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface Student {
  id: string;
  email: string;
  fullName: string;
  batch: string | null;
  status: "active" | "suspended";
  createdAt: string;
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; students: Student[] };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentDirectory() {
  // The admin-gated RLS policies below (profiles read/update) need the
  // caller's real signed-in session, which lives in cookies — the
  // localStorage-backed `@/lib/supabase` singleton used elsewhere in this
  // file's earlier version never carried it, so every request here would
  // silently look "anonymous" to Postgres and RLS would filter everything
  // out (an admin would just see an empty directory, and status toggles
  // would appear to succeed in the UI without ever touching the database).
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [resetSentFor, setResetSentFor] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const { data, error } = await client
        .from("profiles")
        .select("id, email, full_name, batch, status, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (error || !data) {
        setState({ status: "ready", students: [] });
        return;
      }

      setState({
        status: "ready",
        students: data.map((row) => ({
          id: row.id,
          email: row.email,
          fullName: row.full_name || "(no name set)",
          batch: row.batch,
          status: row.status,
          createdAt: row.created_at,
        })),
      });
    };

    void run();
  }, [supabase]);

  const updateStudent = (id: string, patch: Partial<Student>) => {
    setState((current) =>
      current.status === "ready"
        ? {
            status: "ready",
            students: current.students.map((student) =>
              student.id === id ? { ...student, ...patch } : student,
            ),
          }
        : current,
    );
  };

  const toggleStatus = async (student: Student) => {
    if (!supabase) return;
    setRowError(null);
    setBusyId(student.id);
    const nextStatus = student.status === "active" ? "suspended" : "active";

    const { error } = await supabase
      .from("profiles")
      .update({ status: nextStatus })
      .eq("id", student.id);

    setBusyId(null);
    if (error) {
      setRowError({ id: student.id, message: "Couldn't update status." });
      return;
    }
    updateStudent(student.id, { status: nextStatus });
  };

  const sendPasswordReset = async (student: Student) => {
    if (!supabase) return;
    setRowError(null);
    setBusyId(student.id);

    const { error } = await supabase.auth.resetPasswordForEmail(student.email, {
      redirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
    });

    setBusyId(null);
    if (error) {
      setRowError({ id: student.id, message: "Couldn't send reset email." });
      return;
    }
    setResetSentFor(student.id);
    setTimeout(() => setResetSentFor((current) => (current === student.id ? null : current)), 4000);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const student = pendingDelete;
    setBusyId(student.id);
    setRowError(null);

    try {
      const response = await fetch(`/api/admin/students/${student.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error || "Failed to delete this account.");
      }

      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              students: current.students.filter((row) => row.id !== student.id),
            }
          : current,
      );
      setPendingDelete(null);
    } catch (error) {
      setRowError({
        id: student.id,
        message: error instanceof Error ? error.message : "Failed to delete this account.",
      });
      setPendingDelete(null);
    } finally {
      setBusyId(null);
    }
  };

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
              Real registered accounts — suspend, send a password reset, or
              remove access.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-3 text-sm text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p>
            Status and password-reset actions are fully live. Deleting an
            account calls Supabase&apos;s Admin API and needs
            <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
              SUPABASE_SERVICE_ROLE_KEY
            </code>
            configured on the server — it&apos;ll tell you clearly if that
            isn&apos;t set yet rather than fail silently.
          </p>
        </div>
      </motion.div>

      <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />

        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Student</span>
          <span>Batch</span>
          <span>Joined</span>
          <span>Status</span>
          <span>Actions</span>
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
            No registered students yet — once someone signs up at{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
              /auth/register
            </code>
            , they&apos;ll show up here.
          </p>
        )}

        {state.status === "ready" &&
          state.students.map((student, index) => {
            const initial = student.fullName.trim().charAt(0).toUpperCase() || "?";
            const isBusy = busyId === student.id;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
                className="grid grid-cols-2 items-center gap-4 border-b border-slate-800/60 px-6 py-4 last:border-0 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
              >
                <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/30">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {student.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{student.email}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400">{student.batch || "—"}</p>
                <p className="text-sm text-slate-400">{formatDate(student.createdAt)}</p>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                    student.status === "active"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      student.status === "active" ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                  {student.status === "active" ? "Active" : "Suspended"}
                </span>

                <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void sendPasswordReset(student)}
                    title="Send password reset email"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resetSentFor === student.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <KeyRound className="h-3.5 w-3.5" />
                    )}
                    {resetSentFor === student.id ? "Sent" : "Reset"}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void toggleStatus(student)}
                    title={student.status === "active" ? "Suspend" : "Reactivate"}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {student.status === "active" ? (
                      <UserMinus className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    {student.status === "active" ? "Suspend" : "Reactivate"}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setPendingDelete(student)}
                    title="Delete account"
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-400/60 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </button>
                </div>

                {rowError?.id === student.id && (
                  <p className="col-span-2 flex items-center gap-1.5 text-xs text-rose-400 sm:col-span-5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {rowError.message}
                  </p>
                )}
              </motion.div>
            );
          })}
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
            onClick={() => setPendingDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-500/40 bg-slate-900/95 p-7 text-center shadow-[0_0_60px_-10px_rgba(244,63,94,0.6)] backdrop-blur-md"
            >
              <CornerBrackets colorClass="text-rose-400/60" alwaysVisible />
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/40">
                <Trash2 className="h-6 w-6 text-rose-400" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-white">Delete this account?</h2>
              <p className="mt-2 text-sm text-slate-400">
                <strong className="text-slate-200">{pendingDelete.fullName}</strong> (
                {pendingDelete.email}) will permanently lose access. This can&apos;t be undone.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  disabled={busyId === pendingDelete.id}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_-6px_rgba(244,63,94,0.8)] transition-all hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === pendingDelete.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
