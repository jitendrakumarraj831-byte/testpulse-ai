"use client";

import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import type { ExamQuestion, OptionLabel } from "@/lib/exam/mock-exam";

interface QuestionViewerProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption?: OptionLabel;
  onSelectOption: (label: OptionLabel) => void;
}

export function QuestionViewer({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
}: QuestionViewerProps) {
  return (
    <section className="card-glow flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-cyan-500/30">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700">
          {question.subject} &middot; {question.topic}
        </span>
      </div>

      <motion.p
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-5 text-base leading-relaxed text-slate-100 sm:text-lg"
      >
        {question.prompt}
      </motion.p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = option.label === selectedOption;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelectOption(option.label)}
              aria-pressed={isSelected}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left backdrop-blur transition-all ${
                isSelected
                  ? "border-cyan-500/70 bg-cyan-500/10 shadow-[0_0_24px_-8px_rgba(6,182,212,0.85)]"
                  : "border-slate-700/80 bg-white/[0.03] hover:border-cyan-500/30 hover:bg-white/[0.05]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {option.label}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  isSelected ? "text-cyan-100" : "text-slate-300"
                }`}
              >
                {option.text}
              </span>
              {isSelected && (
                <CircleCheck className="ml-auto h-4 w-4 shrink-0 text-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
