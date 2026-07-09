"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Lightbulb,
  ListChecks,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface ExamRow {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
}

interface HardestQuestion {
  text: string;
  missRatePercent: number;
  isEstimated: boolean;
}

interface ExamStats {
  attemptCount: number;
  averageScorePercent: number | null;
  hardestQuestion: HardestQuestion | null;
}

interface QuestionStatRow {
  question_id: number;
  question_text: string;
  attempt_count: number;
  miss_count: number;
  miss_rate_percent: number | null;
}

export function ExamInsightsPanel() {
  const [exams, setExams] = useState<ExamRow[] | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [statsByExam, setStatsByExam] = useState<Record<string, ExamStats | "loading">>({});

  useEffect(() => {
    if (!supabase) {
      setExams([]);
      return;
    }
    supabase
      .from("exams")
      .select("id, title, subject, topic, difficulty, questions")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) {
          setExams([]);
          return;
        }
        setExams(
          data.map((row) => ({
            id: row.id,
            title: row.title,
            subject: row.subject,
            topic: row.topic,
            difficulty: row.difficulty,
            questionCount: Array.isArray(row.questions) ? row.questions.length : 0,
          })),
        );
      });
  }, []);

  const loadStats = async (exam: ExamRow) => {
    if (!supabase) return;
    setStatsByExam((current) => ({ ...current, [exam.id]: "loading" }));

    const { data: responseRows } = await supabase
      .from("student_responses")
      .select("score")
      .eq("exam_id", exam.id);

    const scores = (responseRows ?? []).map((row) => Number(row.score ?? 0));
    const attemptCount = scores.length;
    const averageScorePercent =
      attemptCount > 0 && exam.questionCount > 0
        ? Math.round(
            (scores.reduce((sum, value) => sum + value, 0) /
              attemptCount /
              exam.questionCount) *
              100,
          )
        : null;

    let hardestQuestion: HardestQuestion | null = null;
    try {
      const { data: questionStats, error } = await supabase.rpc(
        "exam_question_stats",
        { target_exam_id: exam.id },
      );
      if (!error && Array.isArray(questionStats)) {
        const rows = questionStats as QuestionStatRow[];
        const worst = [...rows]
          .filter((row) => row.miss_rate_percent !== null && row.attempt_count > 0)
          .sort((a, b) => (b.miss_rate_percent ?? 0) - (a.miss_rate_percent ?? 0))[0];
        if (worst) {
          hardestQuestion = {
            text: worst.question_text,
            missRatePercent: worst.miss_rate_percent ?? 0,
            isEstimated: false,
          };
        }
      }
    } catch {
      // exam_question_stats() migration not applied yet — fall through to the estimate below.
    }

    if (!hardestQuestion && averageScorePercent !== null && averageScorePercent < 70) {
      hardestQuestion = {
        text: exam.topic,
        missRatePercent: 100 - averageScorePercent,
        isEstimated: true,
      };
    }

    setStatsByExam((current) => ({
      ...current,
      [exam.id]: { attemptCount, averageScorePercent, hardestQuestion },
    }));
  };

  const handleSelect = (exam: ExamRow) => {
    const next = selectedExamId === exam.id ? null : exam.id;
    setSelectedExamId(next);
    if (next && !statsByExam[exam.id]) void loadStats(exam);
  };

  return (
    <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <div className="flex items-center gap-3 p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30">
          <ListChecks className="h-5 w-5 text-violet-400" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Exam Insights
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Click a published exam for real class performance, computed from
            actual student submissions.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        {exams === null && (
          <div className="space-y-2 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        )}

        {exams !== null && exams.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No published exams yet — publish one from the AI Generator or Bulk
            Uploader to see insights here.
          </p>
        )}

        {exams?.map((exam) => {
          const isSelected = selectedExamId === exam.id;
          const examStats = statsByExam[exam.id];

          return (
            <div key={exam.id} className="border-b border-slate-800 last:border-0">
              <button
                type="button"
                onClick={() => handleSelect(exam)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {exam.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {exam.subject} &middot; {exam.difficulty} &middot;{" "}
                    {exam.questionCount} questions
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                    isSelected ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="relative border-t border-slate-800/60 bg-slate-950/40 p-6">
                      <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />

                      {examStats === "loading" && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading real submission data…
                        </div>
                      )}

                      {examStats && examStats !== "loading" && (
                        <>
                          {examStats.attemptCount === 0 ? (
                            <p className="text-sm text-slate-500">
                              No submissions yet for this exam.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Class average
                                </p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                  {examStats.averageScorePercent}%
                                </p>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-violet-400"
                                    style={{
                                      width: `${examStats.averageScorePercent ?? 0}%`,
                                    }}
                                  />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                  {examStats.attemptCount} submission
                                  {examStats.attemptCount === 1 ? "" : "s"}
                                </p>
                              </div>

                              {examStats.hardestQuestion && (
                                <div>
                                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-400">
                                    <Target className="h-3.5 w-3.5" />
                                    {examStats.hardestQuestion.isEstimated
                                      ? "Estimated weak area"
                                      : "Hardest question"}
                                  </p>
                                  <p className="mt-2 text-sm font-medium text-white">
                                    {examStats.hardestQuestion.text}
                                  </p>
                                  <p className="mt-1 text-xs text-rose-300">
                                    {examStats.hardestQuestion.missRatePercent}% missed
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {examStats.attemptCount > 0 && (
                            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                              <Lightbulb className="h-4 w-4 shrink-0 text-cyan-400" />
                              <p className="flex-1 text-sm text-slate-300">
                                <span className="font-semibold text-cyan-300">
                                  AI Tip:
                                </span>{" "}
                                {examStats.hardestQuestion
                                  ? `${examStats.hardestQuestion.missRatePercent}% of students are missing ${
                                      examStats.hardestQuestion.isEstimated
                                        ? "this topic"
                                        : "this question"
                                    } on "${exam.topic}."`
                                  : `Class average is ${examStats.averageScorePercent}% — performance looks solid so far.`}{" "}
                                Generate a remedial quiz?
                              </p>
                              <Link
                                href={`/admin/ai-generator?subject=${encodeURIComponent(exam.subject)}&topic=${encodeURIComponent(exam.topic)}`}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                Generate
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
