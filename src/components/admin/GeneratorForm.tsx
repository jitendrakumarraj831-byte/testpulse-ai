"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Wand2 } from "lucide-react";
import {
  DIFFICULTY_LEVELS,
  QUESTION_COUNT_OPTIONS,
  type DifficultyLevel,
} from "@/lib/admin/question-generator";

interface GeneratorFormProps {
  subject: string;
  topic: string;
  totalQuestions: number;
  difficulty: DifficultyLevel;
  isGenerating: boolean;
  showValidation: boolean;
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onTotalQuestionsChange: (value: number) => void;
  onDifficultyChange: (value: DifficultyLevel) => void;
  onGenerate: () => void;
}

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  Easy: "data-[active=true]:bg-emerald-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_20px_-4px_rgba(16,185,129,0.7)]",
  Medium:
    "data-[active=true]:bg-amber-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_20px_-4px_rgba(245,158,11,0.7)]",
  Hard: "data-[active=true]:bg-rose-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_20px_-4px_rgba(244,63,94,0.7)]",
};

export function GeneratorForm({
  subject,
  topic,
  totalQuestions,
  difficulty,
  isGenerating,
  showValidation,
  onSubjectChange,
  onTopicChange,
  onTotalQuestionsChange,
  onDifficultyChange,
  onGenerate,
}: GeneratorFormProps) {
  return (
    <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
          <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-white">
            AI Question Generator
          </h1>
          <p className="text-sm text-slate-500">
            Generate a full exam paper from a subject and topic in seconds.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="subject"
            className="text-sm font-medium text-slate-300"
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            placeholder="e.g. Physics"
            disabled={isGenerating}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {showValidation && !subject.trim() && (
            <p className="mt-1.5 text-xs text-rose-400">
              Subject is required.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="topic" className="text-sm font-medium text-slate-300">
            Topic / Chapter Name
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            placeholder="e.g. Rotational Dynamics"
            disabled={isGenerating}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {showValidation && !topic.trim() && (
            <p className="mt-1.5 text-xs text-rose-400">Topic is required.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="totalQuestions"
            className="text-sm font-medium text-slate-300"
          >
            Total Questions
          </label>
          <div className="relative mt-2">
            <select
              id="totalQuestions"
              value={totalQuestions}
              onChange={(event) =>
                onTotalQuestionsChange(Number(event.target.value))
              }
              disabled={isGenerating}
              className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count} className="bg-slate-900">
                  {count} Questions
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-300">
            Difficulty Level
          </span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                data-active={difficulty === level}
                disabled={isGenerating}
                onClick={() => onDifficultyChange(level)}
                className={`rounded-lg border border-slate-700 bg-slate-950/60 py-2.5 text-sm font-medium text-slate-300 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${DIFFICULTY_STYLES[level]}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        whileHover={isGenerating ? undefined : { scale: 1.01 }}
        whileTap={isGenerating ? undefined : { scale: 0.98 }}
        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        <Wand2 className="h-4 w-4" />
        {isGenerating ? "Generating Exam…" : "Generate Exam via AI"}
      </motion.button>
    </section>
  );
}
