"use client";

import { motion } from "framer-motion";
import { Medal, Trophy, type LucideIcon } from "lucide-react";
import type { RankedLeaderboardEntry } from "@/lib/student/leaderboard";
import { formatRelativeTime } from "@/lib/student/leaderboard";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { RankDelta } from "@/components/leaderboard/RankDelta";

interface TierStyle {
  icon: LucideIcon;
  label: string;
  iconText: string;
  ring: string;
  border: string;
  glow: string;
  gradient: string;
  avatarSize: string;
  order: string;
  lift: string;
}

const TIER_STYLES: Record<1 | 2 | 3, TierStyle> = {
  1: {
    icon: Trophy,
    label: "1st",
    iconText: "text-amber-400",
    ring: "ring-amber-400/60",
    border: "border-amber-500/40",
    glow: "shadow-[0_0_55px_-12px_rgba(251,191,36,0.65)]",
    gradient: "from-amber-500/[0.08] via-slate-900/60 to-slate-950/80",
    avatarSize: "h-16 w-16 text-xl",
    order: "order-1 sm:order-2",
    lift: "sm:-mt-6",
  },
  2: {
    icon: Medal,
    label: "2nd",
    iconText: "text-slate-300",
    ring: "ring-slate-300/50",
    border: "border-slate-400/30",
    glow: "shadow-[0_0_40px_-10px_rgba(203,213,225,0.5)]",
    gradient: "from-slate-400/[0.06] via-slate-900/60 to-slate-950/80",
    avatarSize: "h-12 w-12 text-base",
    order: "order-2 sm:order-1",
    lift: "",
  },
  3: {
    icon: Medal,
    label: "3rd",
    iconText: "text-orange-400",
    ring: "ring-orange-400/50",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_40px_-10px_rgba(251,146,60,0.5)]",
    gradient: "from-orange-500/[0.06] via-slate-900/60 to-slate-950/80",
    avatarSize: "h-12 w-12 text-base",
    order: "order-3",
    lift: "",
  },
};

interface PodiumBlockProps {
  entries: RankedLeaderboardEntry[];
}

export function PodiumBlock({ entries }: PodiumBlockProps) {
  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
      {([1, 2, 3] as const).map((rank) => {
        const entry = entries.find((candidate) => candidate.rank === rank);
        if (!entry) return <div key={rank} className={TIER_STYLES[rank].order} />;

        const tier = TIER_STYLES[rank];
        const initial = entry.studentName.trim().charAt(0).toUpperCase() || "?";
        const Icon = tier.icon;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (rank - 1) * 0.1 }}
            className={`${tier.order} ${tier.lift}`}
          >
            <div
              className={`relative overflow-hidden rounded-2xl border ${tier.border} bg-gradient-to-br ${tier.gradient} p-5 text-center backdrop-blur-xl ${tier.glow} sm:p-6`}
            >
              <CornerBrackets colorClass={`${tier.iconText}/60`} alwaysVisible />

              <div className="flex items-center justify-center gap-1.5">
                <Icon className={`h-5 w-5 ${tier.iconText}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${tier.iconText}`}>
                  {tier.label}
                </span>
              </div>

              <span
                className={`mx-auto mt-4 flex items-center justify-center rounded-full bg-cyan-500/10 font-bold text-cyan-300 ring-2 ${tier.ring} ${tier.avatarSize}`}
              >
                {initial}
              </span>

              <p className="mt-3 truncate text-sm font-semibold text-white sm:text-base">
                {entry.studentName}
              </p>
              <p className="truncate text-xs text-slate-500">{entry.subjectName}</p>

              <p className="mt-3 text-2xl font-bold text-white">
                {entry.score}
                <span className="text-base text-slate-600">
                  /{entry.totalQuestions || "—"}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                {formatRelativeTime(entry.submittedAt)}
              </p>

              <div className="mt-3 flex justify-center">
                <RankDelta rank={entry.rank} previousRank={entry.previousRank} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
