"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Flame, Footprints, Target, type LucideIcon } from "lucide-react";
import { getStreakSummary, type StreakSummary } from "@/lib/student/streak";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

const BADGE_ICONS: Record<string, LucideIcon> = {
  "first-steps": Footprints,
  "consistency-king": Crown,
  "accuracy-master": Target,
};

export function StreakCard() {
  const [summary, setSummary] = useState<StreakSummary | null>(null);

  useEffect(() => {
    setSummary(getStreakSummary());
  }, []);

  if (!summary) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8">
        <div className="h-16 w-48 animate-pulse rounded-lg bg-slate-800/70" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8"
    >
      <CornerBrackets colorClass="text-amber-400/50" alwaysVisible />

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
            <Flame className="h-8 w-8 text-amber-400" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Your Streak
            </p>
            <p className="text-4xl font-bold text-white">
              {summary.currentStreak}
              <span className="ml-1.5 text-base font-medium text-slate-500">
                day{summary.currentStreak === 1 ? "" : "s"}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Longest streak {summary.longestStreak} &middot;{" "}
              {summary.totalAttempts} test{summary.totalAttempts === 1 ? "" : "s"} on
              this device
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {summary.badges.map((badge) => {
            const Icon = BADGE_ICONS[badge.id];
            return (
              <div
                key={badge.id}
                title={badge.description}
                className={`flex w-24 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-colors ${
                  badge.unlocked
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-slate-800 bg-slate-900/60 opacity-50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${badge.unlocked ? "text-amber-400" : "text-slate-600"}`}
                />
                <p
                  className={`text-[11px] font-semibold leading-tight ${
                    badge.unlocked ? "text-amber-300" : "text-slate-500"
                  }`}
                >
                  {badge.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
