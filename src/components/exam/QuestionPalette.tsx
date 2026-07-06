"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Grid3x3 } from "lucide-react";
import type { ExamQuestion, OptionLabel } from "@/lib/exam/mock-exam";

interface QuestionPaletteProps {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<number, OptionLabel>;
  markedForReview: Set<number>;
  onSelect: (index: number) => void;
}

function getButtonStyles(
  isMarked: boolean,
  isAnswered: boolean,
  isCurrent: boolean,
) {
  const base = isMarked
    ? "bg-purple-500 text-slate-950 shadow-[0_0_16px_-4px_rgba(168,85,247,0.9)]"
    : isAnswered
      ? "bg-emerald-500 text-slate-950 shadow-[0_0_16px_-4px_rgba(16,185,129,0.9)]"
      : "bg-slate-800 text-slate-400 border border-slate-700";

  return `${base} ${isCurrent ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950" : ""}`;
}

function PaletteLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Answered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" /> Unanswered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Marked for
        Review
      </span>
    </div>
  );
}

function PaletteGrid({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onSelect,
}: QuestionPaletteProps) {
  return (
    <div className="grid max-h-64 grid-cols-5 gap-2.5 overflow-y-auto pr-1">
      {questions.map((question, index) => {
        const isAnswered = Boolean(answers[index]);
        const isMarked = markedForReview.has(index);
        const isCurrent = index === currentIndex;

        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-105 ${getButtonStyles(isMarked, isAnswered, isCurrent)}`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionPalette(props: QuestionPaletteProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const answeredCount = Object.keys(props.answers).length;

  return (
    <aside className="lg:w-80 lg:shrink-0">
      {/* Mobile: collapsible accordion */}
      <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          className="flex w-full items-center justify-between px-5 py-4"
          aria-expanded={isMobileOpen}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Grid3x3 className="h-4 w-4 text-cyan-400" />
            Question Palette
            <span className="text-slate-500">
              ({answeredCount}/{props.questions.length} answered)
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isMobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
                <PaletteGrid {...props} />
                <PaletteLegend />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: always-visible sidebar */}
      <div className="card-glow sticky top-24 hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 lg:block">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Grid3x3 className="h-4 w-4 text-cyan-400" />
          Question Palette
        </span>
        <div className="mt-4">
          <PaletteGrid {...props} />
        </div>
        <PaletteLegend />
      </div>
    </aside>
  );
}
