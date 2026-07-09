"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Lightbulb, TrendingDown } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface SubjectScore {
  name: string;
  avgScore: number;
  barClass: string;
}

const SUBJECT_SCORES: SubjectScore[] = [
  { name: "Current Affairs", avgScore: 88, barClass: "bg-emerald-400" },
  { name: "General Knowledge", avgScore: 82, barClass: "bg-purple-400" },
  { name: "Science", avgScore: 71, barClass: "bg-cyan-400" },
  { name: "Mathematics", avgScore: 64, barClass: "bg-amber-400" },
];

interface LowScoringTopic {
  topic: string;
  subject: string;
  avgScore: number;
}

const LOW_SCORING_TOPICS: LowScoringTopic[] = [
  { topic: "Rotational Dynamics", subject: "Science", avgScore: 54 },
  { topic: "Advanced Trigonometry", subject: "Mathematics", avgScore: 58 },
  { topic: "Organic Chemistry", subject: "Science", avgScore: 61 },
];

const REMEDIAL_SUGGESTIONS = [
  "Schedule a 15-minute recap on Rotational Dynamics before the next Science test — recent batches are averaging under 60% here.",
  "Trigonometry questions are being skipped more than answered incorrectly — a worked-example session may help more than extra practice questions.",
  "Organic Chemistry scores dip specifically on multi-step reaction questions — isolate that sub-topic in the next AI-generated test.",
];

function scoreStatusClass(score: number): string {
  if (score < 60) return "text-rose-300 bg-rose-500/10 ring-1 ring-rose-500/30";
  return "text-amber-300 bg-amber-500/10 ring-1 ring-amber-500/30";
}

export function LiveAnalyticsPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Live Exam Analytics
              </h2>
              <span className="rounded-full border border-slate-700 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                Sample data preview
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              See what teachers see: performance by subject, weak topics, and
              AI remedial suggestions.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          aria-controls={panelId}
          aria-label="Toggle live exam analytics preview"
          onClick={() => setIsOpen((open) => !open)}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 ${
            isOpen
              ? "border-cyan-500/50 bg-cyan-500/15 shadow-[0_0_24px_-6px_rgba(6,182,212,0.7)]"
              : "border-slate-700 bg-slate-800"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              isOpen ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="relative border-t border-slate-800 p-6 pt-5">
              <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Average score by subject
                  </p>
                  <div className="mt-4 space-y-3.5">
                    {SUBJECT_SCORES.map((subject) => (
                      <div key={subject.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-300">
                            {subject.name}
                          </span>
                          <span className="font-bold text-white">
                            {subject.avgScore}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.avgScore}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${subject.barClass}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    Topics needing attention
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {LOW_SCORING_TOPICS.map((item) => (
                      <div
                        key={item.topic}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {item.topic}
                          </p>
                          <p className="text-xs text-slate-500">{item.subject}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreStatusClass(item.avgScore)}`}
                        >
                          {item.avgScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  <Lightbulb className="h-3.5 w-3.5" />
                  AI remedial suggestions
                </p>
                <ul className="mt-3 space-y-2.5">
                  {REMEDIAL_SUGGESTIONS.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
