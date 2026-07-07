"use client";

import Link from "next/link";
import { Clock, ListChecks, Lock, PlayCircle } from "lucide-react";
import type { MockExam } from "@/lib/student/exams";
import type { SubjectAccent } from "@/lib/student/subjects";

interface ExamCardProps {
  exam: MockExam;
  accent: SubjectAccent;
}

const DIFFICULTY_BADGE: Record<MockExam["difficulty"], string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  Medium: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  Hard: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
};

export function ExamCard({ exam, accent }: ExamCardProps) {
  const isAvailable = exam.status === "available";

  return (
    <div
      className={`card-glow flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 ${
        isAvailable
          ? `${accent.hoverBorder} ${accent.hoverShadow}`
          : "opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{exam.title}</h3>
        {isAvailable ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 shadow-[0_0_12px_-2px_rgba(16,185,129,0.7)] ring-1 ring-emerald-500/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Available Now
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30">
            <Lock className="h-3 w-3" />
            Locked
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700">
          <ListChecks className="h-3.5 w-3.5" />
          {exam.questionCount} Questions
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700">
          <Clock className="h-3.5 w-3.5" />
          {exam.durationMinutes} Mins
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${DIFFICULTY_BADGE[exam.difficulty]}`}
        >
          {exam.difficulty}
        </span>
      </div>

      <div className="mt-auto pt-6">
        {isAvailable ? (
          <Link
            href={`/test/${exam.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)]"
          >
            <PlayCircle className="h-4 w-4" />
            Start Test
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-500"
          >
            <Lock className="h-4 w-4" />
            Unlocks Soon
          </button>
        )}
      </div>
    </div>
  );
}
