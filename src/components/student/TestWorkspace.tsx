"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type {
  ApiQuestion,
  DifficultyLevel,
  OptionLabel,
} from "@/lib/admin/question-generator";
import type { SubjectAccent } from "@/lib/student/subjects";
import type { StudentResponseInsert } from "@/lib/student/responses";
import { createClient } from "@/utils/supabase/client";

interface TestWorkspaceProps {
  examId: string;
  examTitle: string;
  subjectName: string;
  subjectSlug: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questions: ApiQuestion[];
  accent: SubjectAccent;
}

type SaveStatus = "idle" | "saved" | "error";

const OPTION_LABELS: OptionLabel[] = ["A", "B", "C", "D"];
const DEFAULT_STUDENT_NAME = "Guest Student";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TestWorkspace({
  examId,
  examTitle,
  subjectName,
  subjectSlug,
  difficulty,
  durationMinutes,
  questions,
  accent,
}: TestWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [studentName, setStudentName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [finalScore, setFinalScore] = useState(0);

  const submitTest = async () => {
    if (isSaving || isSubmitted) return;
    setIsSaving(true);

    const score = questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length;

    try {
      const supabase = createClient();
      const payload: StudentResponseInsert = {
        exam_id: examId,
        student_name: studentName.trim() || DEFAULT_STUDENT_NAME,
        answers,
        score,
      };
      const { error } = await supabase
        .from("student_responses")
        .insert(payload);

      if (error) throw error;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save test response:", error);
      setSaveStatus("error");
    } finally {
      setFinalScore(score);
      setIsSaving(false);
      setIsSubmitted(true);
    }
  };

  const submitTestRef = useRef(submitTest);
  submitTestRef.current = submitTest;

  useEffect(() => {
    if (isSubmitted || isSaving) return;
    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          void submitTestRef.current();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, isSaving]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const selectOption = (label: OptionLabel) => {
    if (isSubmitted || isSaving) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: label }));
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsSaving(false);
    setSaveStatus("idle");
    setSecondsLeft(durationMinutes * 60);
  };

  if (isSubmitted) {
    return (
      <main className="flex-1 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-md"
          >
            <span
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${accent.iconBg}`}
            >
              <CheckCircle2 className={`h-7 w-7 ${accent.iconText}`} />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              Test Complete
            </h1>
            <p className="mt-2 text-sm text-slate-400">{examTitle}</p>
            <p className="mt-6 text-4xl font-bold text-white">
              {finalScore} / {questions.length}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {Math.round((finalScore / questions.length) * 100)}% correct
            </p>

            {saveStatus === "saved" && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved to your progress history
              </p>
            )}
            {saveStatus === "error" && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Your score was calculated, but this attempt couldn&apos;t be
                saved.
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Test
              </button>
              <Link
                href={`/exams/${subjectSlug}`}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)]"
              >
                Back to {subjectName} Exams
              </Link>
            </div>
          </motion.div>

          <div className="mt-8 space-y-4">
            {questions.map((question, index) => {
              const selected = answers[question.id];
              const isCorrect = selected === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-300">
                      Question {index + 1}: {question.question}
                    </p>
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {question.options.map((optionText, optionIndex) => {
                      const label = OPTION_LABELS[optionIndex];
                      const isCorrectOption = label === question.correctAnswer;
                      const isSelectedOption = label === selected;

                      return (
                        <div
                          key={label}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isCorrectOption
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                              : isSelectedOption
                                ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                                : "border-slate-700/80 bg-white/[0.03] text-slate-400"
                          }`}
                        >
                          <span className="font-semibold">{label}.</span>{" "}
                          {optionText}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {question.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 pb-32 pt-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {subjectName} &middot; {difficulty}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              {examTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder={DEFAULT_STUDENT_NAME}
              disabled={isSaving}
              aria-label="Your name"
              className="w-32 rounded-full border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40 sm:text-sm"
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              {formatTime(secondsLeft)}
            </span>
            <Link
              href={`/exams/${subjectSlug}`}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-cyan-400"
            >
              Exit
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {questions.map((question, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = answers[question.id] !== undefined;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isCurrent
                    ? `${accent.activeRing} text-white`
                    : isAnswered
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                      : "border-slate-700 text-slate-500 hover:border-slate-600"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {answeredCount} of {questions.length} answered
        </p>

        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-glow mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <p className="mt-3 text-base leading-relaxed text-slate-100 sm:text-lg">
            {currentQuestion.question}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((optionText, optionIndex) => {
              const label = OPTION_LABELS[optionIndex];
              const isSelected = answers[currentQuestion.id] === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectOption(label)}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-slate-700/80 bg-white/[0.03] hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-sm leading-relaxed ${
                      isSelected ? "text-cyan-100" : "text-slate-300"
                    }`}
                  >
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0 || isSaving}
            className="rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              onClick={() => void submitTest()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Submit Test"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((index) =>
                  Math.min(questions.length - 1, index + 1),
                )
              }
              disabled={isSaving}
              className="rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
