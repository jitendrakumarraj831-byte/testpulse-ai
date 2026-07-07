"use client";

import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";
import { formatRelativeTime } from "@/lib/student/leaderboard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const RANK_STYLES = [
  {
    icon: Trophy,
    ring: "ring-amber-400/60",
    iconColor: "text-amber-400",
    glow: "shadow-[0_0_25px_-6px_rgba(251,191,36,0.6)]",
    border: "border-amber-500/30",
  },
  {
    icon: Medal,
    ring: "ring-slate-300/50",
    iconColor: "text-slate-300",
    glow: "shadow-[0_0_20px_-6px_rgba(203,213,225,0.5)]",
    border: "border-slate-400/20",
  },
  {
    icon: Medal,
    ring: "ring-orange-400/50",
    iconColor: "text-orange-400",
    glow: "shadow-[0_0_20px_-6px_rgba(251,146,60,0.5)]",
    border: "border-orange-500/20",
  },
];

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center backdrop-blur-md">
        <p className="text-sm font-medium text-slate-400">
          No submissions match these filters yet.
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Be the first to set a score on the board.
        </p>
      </div>
    );
  }

  return (
    <div className="card-glow overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      {entries.map((entry, index) => {
        const rankStyle = RANK_STYLES[index];
        const Icon = rankStyle?.icon;
        const initial = entry.studentName.trim().charAt(0).toUpperCase() || "?";

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index, 12) * 0.04 }}
            className={`flex items-center gap-4 border-b border-slate-800/60 px-4 py-4 last:border-0 sm:px-6 ${
              rankStyle ? `bg-white/[0.02] ${rankStyle.border} border-l-2` : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              {Icon ? (
                <Icon className={`h-5 w-5 ${rankStyle.iconColor}`} />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-400">
                  {index + 1}
                </span>
              )}
            </span>

            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ${
                rankStyle ? `${rankStyle.ring} ${rankStyle.glow}` : "ring-cyan-500/30"
              }`}
            >
              {initial}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {entry.studentName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {entry.subjectName}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-cyan-400">
                {entry.score}
                <span className="text-slate-600">/{entry.totalQuestions || "—"}</span>
              </p>
              <p className="text-xs text-slate-600">
                {formatRelativeTime(entry.submittedAt)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
