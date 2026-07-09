"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Lightbulb,
  Loader2,
  Mail,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ApiQuestion, OptionLabel } from "@/lib/admin/question-generator";

interface PerformanceBreakdownProps {
  subjectName: string;
  examTitle: string;
  score: number;
  questions: ApiQuestion[];
  answers: Record<number, OptionLabel>;
}

interface Breakdown {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  remedialTips: string[];
  source: "ai" | "heuristic";
}

function buildShareText(examTitle: string, breakdown: Breakdown): string {
  return [
    `${examTitle} — Strength & Weakness Matrix`,
    "",
    breakdown.summary,
    "",
    "Strengths:",
    ...breakdown.strengths.map((item) => `- ${item}`),
    "",
    "Weaknesses:",
    ...breakdown.weaknesses.map((item) => `- ${item}`),
    "",
    "Remedial Tips:",
    ...breakdown.remedialTips.map((item) => `- ${item}`),
  ].join("\n");
}

export function PerformanceBreakdown({
  subjectName,
  examTitle,
  score,
  questions,
  answers,
}: PerformanceBreakdownProps) {
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyLabel, setCopyLabel] = useState("Copy Summary");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const items = questions.map((question) => ({
          question: question.question,
          isCorrect: answers[question.id] === question.correctAnswer,
        }));

        const response = await fetch("/api/analyze-performance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectName,
            examTitle,
            score,
            totalQuestions: questions.length,
            items,
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: Breakdown = await response.json();
        if (!cancelled) setBreakdown(data);
      } catch (error) {
        console.error("Failed to load performance breakdown:", error);
        if (!cancelled) setBreakdown(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // Runs once per submitted attempt — questions/answers/score are stable by then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!breakdown) return;
    try {
      await navigator.clipboard.writeText(buildShareText(examTitle, breakdown));
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Summary"), 2000);
    } catch (error) {
      console.error("Failed to copy summary:", error);
    }
  };

  const handleDownload = () => {
    if (!breakdown) return;
    const blob = new Blob([buildShareText(examTitle, breakdown)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${examTitle.replace(/\s+/g, "-").toLowerCase()}-breakdown.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleEmail = () => {
    if (!breakdown) return;
    const subject = encodeURIComponent(`${examTitle} — Performance Breakdown`);
    const body = encodeURIComponent(buildShareText(examTitle, breakdown));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="card-glow mt-8 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <p className="text-sm text-slate-400">Analyzing your performance…</p>
      </div>
    );
  }

  if (!breakdown) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glow mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8"
    >
      <div className="flex items-start gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
          <Sparkles className="h-5 w-5 text-cyan-400" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
            {breakdown.source === "ai"
              ? "AI Strength & Weakness Matrix"
              : "Strength & Weakness Matrix"}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">{breakdown.summary}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Strengths
          </p>
          <ul className="mt-3 space-y-2">
            {breakdown.strengths.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-400">
            <TrendingDown className="h-3.5 w-3.5" />
            Weaknesses
          </p>
          <ul className="mt-3 space-y-2">
            {breakdown.weaknesses.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          <Lightbulb className="h-3.5 w-3.5" />
          Remedial Tips
        </p>
        <ul className="mt-2.5 space-y-2">
          {breakdown.remedialTips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm leading-relaxed text-slate-300"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
        >
          <Copy className="h-3.5 w-3.5" />
          {copyLabel}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
        >
          <Mail className="h-3.5 w-3.5" />
          Email to Teacher
        </button>
      </div>
    </motion.div>
  );
}
