"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, ListChecks, PenLine } from "lucide-react";

interface ExamCompletedScreenProps {
  title: string;
  autoSubmitted: boolean;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  totalQuestions: number;
}

export function ExamCompletedScreen({
  title,
  autoSubmitted,
  answeredCount,
  unansweredCount,
  markedCount,
  totalQuestions,
}: ExamCompletedScreenProps) {
  return (
    <div className="glow-field flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card-glow w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/40"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </motion.div>

        <h1 className="mt-5 text-xl font-bold text-white">
          {autoSubmitted ? "Time's Up — Test Submitted" : "Test Submitted"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {autoSubmitted
            ? `Your countdown for "${title}" reached zero, so your responses were submitted automatically.`
            : `Your responses for "${title}" have been submitted successfully.`}
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <ListChecks className="mx-auto h-4 w-4 text-emerald-400" />
            <p className="mt-2 text-xl font-bold text-emerald-400">
              {answeredCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">Answered</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <PenLine className="mx-auto h-4 w-4 text-slate-400" />
            <p className="mt-2 text-xl font-bold text-slate-300">
              {unansweredCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">Unanswered</p>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <Clock className="mx-auto h-4 w-4 text-purple-400" />
            <p className="mt-2 text-xl font-bold text-purple-400">
              {markedCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">For Review</p>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          {answeredCount} of {totalQuestions} questions answered.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.95)]"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
