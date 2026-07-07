"use client";

import { motion } from "framer-motion";
import { SUBJECTS } from "@/lib/student/subjects";
import type { SubjectFilter, TimeframeFilter } from "@/lib/student/leaderboard";

interface LeaderboardFiltersProps {
  subjectFilter: SubjectFilter;
  timeframeFilter: TimeframeFilter;
  onSubjectChange: (value: SubjectFilter) => void;
  onTimeframeChange: (value: TimeframeFilter) => void;
}

const SUBJECT_TABS: { slug: SubjectFilter; label: string }[] = [
  { slug: "all", label: "All" },
  ...SUBJECTS.map((subject) => ({ slug: subject.slug, label: subject.shortLabel })),
];

const TIMEFRAME_OPTIONS: { value: TimeframeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "all", label: "All Time" },
];

export function LeaderboardFilters({
  subjectFilter,
  timeframeFilter,
  onSubjectChange,
  onTimeframeChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-1.5 rounded-full border border-slate-800 bg-slate-900/40 p-1.5">
        {SUBJECT_TABS.map((tab) => {
          const isActive = subjectFilter === tab.slug;
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => onSubjectChange(tab.slug)}
              className="relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
            >
              {isActive && (
                <motion.span
                  layoutId="leaderboard-subject-tab"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-cyan-500 shadow-[0_0_20px_-4px_rgba(6,182,212,0.8)]"
                />
              )}
              <span
                className={`relative z-10 ${
                  isActive ? "text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <select
        value={timeframeFilter}
        onChange={(event) =>
          onTimeframeChange(event.target.value as TimeframeFilter)
        }
        className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
      >
        {TIMEFRAME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
