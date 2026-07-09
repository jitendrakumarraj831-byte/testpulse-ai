"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  ListChecks,
  RefreshCcw,
  Rocket,
} from "lucide-react";
import type { GeneratedQuestion, PublishExamResponse } from "@/lib/admin/question-generator";
import { QuestionCard } from "@/components/admin/QuestionCard";

interface ResultsPanelProps {
  questions: GeneratedQuestion[];
  isPublishing: boolean;
  isPublished: boolean;
  publishedUrl: string | null;
  publishSource: PublishExamResponse["source"] | null;
  publishError: string | null;
  onRegenerate: () => void;
  onPublish: () => void;
  onCreateAnother: () => void;
}

export function ResultsPanel({
  questions,
  isPublishing,
  isPublished,
  publishedUrl,
  publishSource,
  publishError,
  onRegenerate,
  onPublish,
  onCreateAnother,
}: ResultsPanelProps) {
  const [firstQuestion] = questions;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="card-glow flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <ListChecks className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">
              {questions.length} Questions Ready for Review
            </h2>
            <p className="text-sm text-slate-500">
              {firstQuestion?.subject} &middot; {firstQuestion?.topic} &middot;{" "}
              {firstQuestion?.difficulty} difficulty
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>

      <div className="card-glow sticky bottom-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-lg">
        <AnimatePresence mode="wait" initial={false}>
          {isPublished && publishedUrl ? (
            <motion.div
              key="published"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                {publishSource === "simulated" ? (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    Not actually saved — Supabase isn&apos;t reachable right
                    now, so this link won&apos;t work for students.
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Test published successfully — now live for students.
                  </div>
                )}
                <a
                  href={publishedUrl}
                  className={`mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    publishSource === "simulated"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/60 hover:text-amber-200"
                      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {publishedUrl}
                </a>
                {publishSource === "simulated" && (
                  <p className="mt-2 max-w-md text-xs text-slate-500">
                    Configure Supabase (or check your connection) and publish
                    this batch again once it&apos;s reachable.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onCreateAnother}
                className="rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              >
                Create Another Batch
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="unpublished"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  Review each question above before publishing this batch to
                  students.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onRegenerate}
                    disabled={isPublishing}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Regenerate Batch
                  </button>
                  <motion.button
                    type="button"
                    onClick={onPublish}
                    disabled={isPublishing}
                    whileHover={isPublishing ? undefined : { scale: 1.02 }}
                    whileTap={isPublishing ? undefined : { scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Rocket className="h-4 w-4" />
                    {isPublishing ? "Publishing…" : "Approve & Publish Test"}
                  </motion.button>
                </div>
              </div>
              {publishError && (
                <p className="text-sm text-rose-400">{publishError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
