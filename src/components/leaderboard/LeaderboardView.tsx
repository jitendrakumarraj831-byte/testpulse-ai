"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Trophy } from "lucide-react";
import {
  aggregateLeaderboard,
  type LeaderboardEntry,
  type SubjectFilter,
  type TimeframeFilter,
} from "@/lib/student/leaderboard";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PodiumBlock } from "@/components/leaderboard/PodiumBlock";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  isAvailable: boolean;
}

export function LeaderboardView({ entries, isAvailable }: LeaderboardViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>("all");

  const rankedEntries = useMemo(
    () => aggregateLeaderboard(entries, subjectFilter, timeframeFilter),
    [entries, subjectFilter, timeframeFilter],
  );

  const podiumEntries = rankedEntries.slice(0, 3);
  const restEntries = rankedEntries.slice(3);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Live rankings
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <Trophy className="h-5.5 w-5.5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">
              Live Leaderboard
            </h1>
            <p className="text-sm text-slate-500">
              Top scores across every subject, ranked in real time.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8"
      >
        <LeaderboardFilters
          subjectFilter={subjectFilter}
          timeframeFilter={timeframeFilter}
          onSubjectChange={setSubjectFilter}
          onTimeframeChange={setTimeframeFilter}
        />
      </motion.div>

      {!isAvailable && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Live leaderboard data is temporarily unavailable — check back soon.
        </p>
      )}

      {podiumEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8"
        >
          <PodiumBlock entries={podiumEntries} />
        </motion.div>
      )}

      {(rankedEntries.length === 0 || restEntries.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <LeaderboardTable entries={restEntries} />
        </motion.div>
      )}
    </main>
  );
}
