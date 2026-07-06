"use client";

import { Clock, Send } from "lucide-react";
import { formatCountdown } from "@/lib/exam/mock-exam";

interface ExamHeaderProps {
  title: string;
  secondsRemaining: number;
  onSubmitClick: () => void;
}

export function ExamHeader({
  title,
  secondsRemaining,
  onSubmitClick,
}: ExamHeaderProps) {
  const isCritical = secondsRemaining <= 60;
  const isUrgent = secondsRemaining <= 300;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white sm:text-base">
            {title}
          </p>
          <p className="text-xs text-slate-500">Live Proctored Session</p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 backdrop-blur transition-colors ${
              isCritical
                ? "animate-pulse border-rose-500/50 bg-rose-500/10 text-rose-400"
                : isUrgent
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatCountdown(secondsRemaining)}
            </span>
          </div>

          <button
            type="button"
            onClick={onSubmitClick}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_28px_-2px_rgba(6,182,212,0.9)]"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
