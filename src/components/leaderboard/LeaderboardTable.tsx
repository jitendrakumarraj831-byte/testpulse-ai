"use client";

import { motion } from "framer-motion";
import type { RankedLeaderboardEntry } from "@/lib/student/leaderboard";
import { formatRelativeTime } from "@/lib/student/leaderboard";
import { RankDelta } from "@/components/leaderboard/RankDelta";

interface LeaderboardTableProps {
  entries: RankedLeaderboardEntry[];
}

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
        const initial = entry.studentName.trim().charAt(0).toUpperCase() || "?";

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index, 12) * 0.04 }}
            className="flex items-center gap-4 border-b border-slate-800/60 px-4 py-4 last:border-0 sm:px-6"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-400">
              {entry.rank}
            </span>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/30">
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

            <RankDelta rank={entry.rank} previousRank={entry.previousRank} compact />

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
