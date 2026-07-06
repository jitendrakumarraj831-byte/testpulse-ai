"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleCheck, Sparkles } from "lucide-react";
import type { GeneratedQuestion } from "@/lib/admin/question-generator";

interface QuestionCardProps {
  question: GeneratedQuestion;
}

const DIFFICULTY_BADGE: Record<GeneratedQuestion["difficulty"], string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  Medium: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  Hard: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
};

export function QuestionCard({ question }: QuestionCardProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  return (
    <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-cyan-500/30">
          Question {question.questionNumber}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${DIFFICULTY_BADGE[question.difficulty]}`}
        >
          {question.difficulty}
        </span>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700">
          {question.subject} &middot; {question.topic}
        </span>
      </div>

      <p className="mt-4 text-base leading-relaxed text-slate-100">
        {question.prompt}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isCorrect = option.label === question.correctLabel;
          return (
            <div
              key={option.label}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur transition-colors ${
                isCorrect
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-slate-700/80 bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCorrect
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {option.label}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  isCorrect ? "text-cyan-100" : "text-slate-300"
                }`}
              >
                {option.text}
              </span>
              {isCorrect && (
                <CircleCheck className="ml-auto h-4 w-4 shrink-0 text-cyan-400" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <CircleCheck className="h-4 w-4 text-cyan-400" />
        <span className="font-medium text-slate-300">
          Correct Answer:{" "}
          <span className="font-semibold text-cyan-400">
            {question.correctLabel}
          </span>
        </span>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={() => setIsExplanationOpen((open) => !open)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isExplanationOpen}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI Explanation
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
              isExplanationOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isExplanationOpen && (
            <motion.div
              key="explanation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm leading-relaxed text-slate-300">
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
