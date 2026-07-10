"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
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
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { getStoredStudentName, rememberStudentName } from "@/lib/student/streak";
import { awardLearningPoints } from "@/lib/student/rewards";
import { getInstituteSettings } from "@/lib/admin/settings";
import { PerformanceBreakdown } from "@/components/student/PerformanceBreakdown";

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
const MAX_INFRACTIONS = 3;
const LOW_TIME_THRESHOLD_SECONDS = 2 * 60;
const DISQUALIFY_REDIRECT_DELAY_MS = 2800;

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
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [studentName, setStudentName] = useState("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [finalScore, setFinalScore] = useState(0);

  // Anti-cheat engine state. Defaults to on (matches institute_settings'
  // own default) so there's no gap between mount and the settings fetch
  // resolving where proctoring is silently off.
  const [aiProctoringEnabled, setAiProctoringEnabled] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);

  useEffect(() => {
    void getInstituteSettings().then((settings) => {
      setAiProctoringEnabled(settings.aiProctoringEnabled);
    });
  }, []);

  // Prefill the name field from a prior visit, client-side only (avoids an
  // SSR/hydration mismatch on the controlled input's value). If a session
  // exists, the signed-in profile's name wins — it's the authoritative
  // identity submissions should be tied to going forward.
  useEffect(() => {
    const stored = getStoredStudentName();
    if (stored) setStudentName(stored);

    const client = createClient();
    void client.auth.getUser().then(({ data }) => {
      const user = data.user;
      setAuthUserId(user?.id ?? null);
      const profileName = user?.user_metadata?.full_name;
      if (typeof profileName === "string" && profileName.trim()) {
        setStudentName(profileName.trim());
      }
    });
  }, []);

  const submitTest = async () => {
    if (isSaving || isSubmitted) return;
    setIsSaving(true);

    const score = questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length;

    rememberStudentName(studentName.trim() || DEFAULT_STUDENT_NAME);

    try {
      const supabase = createClient();
      const payload: StudentResponseInsert = {
        exam_id: examId,
        student_name: studentName.trim() || DEFAULT_STUDENT_NAME,
        student_id: authUserId,
        answers,
        score,
      };
      const { error } = await supabase
        .from("student_responses")
        .insert(payload);

      if (error) throw error;
      setSaveStatus("saved");

      // Reward points are earned from real submission history computed
      // server-side (see award_learning_points() in supabase/schema.sql) —
      // fire-and-forget here since it's not on the critical submit path,
      // and the student's Reward Vault card re-derives the same state on
      // its own next load either way.
      if (authUserId) {
        void awardLearningPoints(supabase);
      }
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

  // Countdown timer — pauses while a tab-switch warning is showing or the
  // student has already been disqualified/submitted.
  useEffect(() => {
    if (isSubmitted || isSaving || isPaused) return;
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
  }, [isSubmitted, isSaving, isPaused]);

  // Tab-switch / window-blur detection — each time the student navigates
  // away from the exam tab, count an infraction. Skipped entirely when the
  // admin has turned AI Proctoring off in System Settings.
  useEffect(() => {
    if (isSubmitted || isDisqualified || !aiProctoringEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((count) => count + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSubmitted, isDisqualified, aiProctoringEnabled]);

  // React to a new infraction: show the warning, or disqualify at the cap.
  useEffect(() => {
    if (tabSwitchCount === 0) return;

    setIsPaused(true);
    if (tabSwitchCount >= MAX_INFRACTIONS) {
      setShowWarning(false);
      setIsDisqualified(true);
    } else {
      setShowWarning(true);
    }
  }, [tabSwitchCount]);

  // Force-submit and redirect once disqualified for repeated violations.
  useEffect(() => {
    if (!isDisqualified) return;

    void submitTestRef.current();
    const timeout = setTimeout(() => {
      router.push("/leaderboard");
    }, DISQUALIFY_REDIRECT_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [isDisqualified, router]);

  const resumeTest = () => {
    setShowWarning(false);
    setIsPaused(false);
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const isLowTime = secondsLeft > 0 && secondsLeft <= LOW_TIME_THRESHOLD_SECONDS;
  const isLocked = isSaving || showWarning || isDisqualified;
  // AI-published exams whose subject label doesn't match a browsable
  // SUBJECTS entry resolve to slug "unknown" — /exams/unknown would 404.
  const examsHref = subjectSlug === "unknown" ? "/" : `/exams/${subjectSlug}`;

  const selectOption = (label: OptionLabel) => {
    if (isSubmitted || isLocked) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: label }));
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsSaving(false);
    setSaveStatus("idle");
    setSecondsLeft(durationMinutes * 60);
    setTabSwitchCount(0);
    setShowWarning(false);
    setIsPaused(false);
    setIsDisqualified(false);
  };

  // Anti-cheat: block copy/paste/cut and the right-click context menu
  // while the student is actively taking the exam.
  const blockClipboardEvent = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const blockContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
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
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                isDisqualified ? "bg-rose-500/10" : accent.iconBg
              }`}
            >
              {isDisqualified ? (
                <ShieldAlert className="h-7 w-7 text-rose-400" />
              ) : (
                <CheckCircle2 className={`h-7 w-7 ${accent.iconText}`} />
              )}
            </span>
            <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              {isDisqualified ? "Test Auto-Submitted" : "Test Complete"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{examTitle}</p>
            <p className="mt-6 text-4xl font-bold text-white">
              {finalScore} / {questions.length}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {Math.round((finalScore / questions.length) * 100)}% correct
            </p>

            {isDisqualified && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Disqualified after {MAX_INFRACTIONS} proctoring violations —
                redirecting to the leaderboard…
              </p>
            )}
            {!isDisqualified && saveStatus === "saved" && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved to your progress history
              </p>
            )}
            {!isDisqualified && saveStatus === "error" && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Your score was calculated, but this attempt couldn&apos;t be
                saved.
              </p>
            )}

            {!isDisqualified && (
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
                  href={examsHref}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)]"
                >
                  Back to {subjectName} Exams
                </Link>
              </div>
            )}
          </motion.div>

          {!isDisqualified && (
            <PerformanceBreakdown
              subjectName={subjectName}
              examTitle={examTitle}
              score={finalScore}
              questions={questions}
              answers={answers}
            />
          )}

          {!isDisqualified && (
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
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      onCopy={blockClipboardEvent}
      onCut={blockClipboardEvent}
      onPaste={blockClipboardEvent}
      onContextMenu={blockContextMenu}
      className="flex-1 pb-32"
    >
      {/* Sticky proctored-exam header: subject, timer, progress bar. */}
      <div className="sticky top-16 z-30 border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {subjectName} &middot; {difficulty}
              </p>
              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
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
              <Link
                href={examsHref}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-cyan-400"
              >
                Exit
              </Link>
            </div>
          </div>

          {/* Proctoring HUD: live status strip reusing the CommandDeck
              glow/corner-bracket vocabulary — surfaces the anti-cheat state
              (previously only visible in the violation modal) at all times. */}
          <div className="card-glow relative mt-4 overflow-hidden rounded-xl border border-rose-500/20 bg-slate-900/50 px-4 py-3">
            <CornerBrackets colorClass="text-rose-400/70" alwaysVisible />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    aiProctoringEnabled
                      ? "bg-rose-500/10 ring-1 ring-rose-500/30"
                      : "bg-slate-800 ring-1 ring-slate-700"
                  }`}
                >
                  <ShieldCheck
                    className={`h-4 w-4 ${aiProctoringEnabled ? "text-rose-400" : "text-slate-500"}`}
                  />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">
                      Proctoring
                    </p>
                    {aiProctoringEnabled && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-white">
                    {aiProctoringEnabled ? "Active" : "Off"}
                  </p>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isLowTime
                      ? "bg-rose-500/10 ring-1 ring-rose-500/30"
                      : "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  }`}
                >
                  <Clock
                    className={`h-4 w-4 ${isLowTime ? "text-rose-400" : "text-cyan-400"}`}
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time Left
                  </p>
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      isLowTime ? "animate-pulse text-rose-300" : "text-white"
                    }`}
                  >
                    {formatTime(secondsLeft)}
                  </p>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    tabSwitchCount > 0
                      ? "bg-amber-500/10 ring-1 ring-amber-500/30"
                      : "bg-slate-800 ring-1 ring-slate-700"
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${tabSwitchCount > 0 ? "text-amber-400" : "text-slate-500"}`}
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Infractions
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      tabSwitchCount > 0 ? "text-amber-300" : "text-white"
                    }`}
                  >
                    {tabSwitchCount}/{MAX_INFRACTIONS}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {answeredCount} of {questions.length} answered
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {questions.map((question, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = answers[question.id] !== undefined;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                disabled={isLocked}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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

          <div className="mt-6 flex flex-col gap-3">
            {currentQuestion.options.map((optionText, optionIndex) => {
              const label = OPTION_LABELS[optionIndex];
              const isSelected = answers[currentQuestion.id] === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectOption(label)}
                  disabled={isLocked}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
            disabled={currentIndex === 0 || isLocked}
            className="rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous Question
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              onClick={() => void submitTest()}
              disabled={isLocked}
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
              disabled={isLocked}
              className="rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Next Question
            </button>
          )}
        </div>
      </div>

      {/* Anti-cheat: tab-switch warning modal (infractions 1 & 2 of 3). */}
      <AnimatePresence>
        {showWarning && !isDisqualified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-rose-950/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900/95 p-8 text-center shadow-[0_0_60px_-10px_rgba(244,63,94,0.6)] backdrop-blur-md"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/40">
                <AlertTriangle className="h-7 w-7 text-rose-400" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-white">
                Warning: Tab Switch Detected!
              </h2>
              <p className="mt-2 text-2xl font-bold text-rose-400">
                {tabSwitchCount}/{MAX_INFRACTIONS} Infractions
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Leaving this tab or window during a proctored exam is flagged
                as a violation. Your timer is paused. Reaching{" "}
                {MAX_INFRACTIONS} infractions will automatically submit your
                test.
              </p>
              <button
                type="button"
                onClick={resumeTest}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400"
              >
                Resume Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-cheat: disqualification overlay (3rd infraction). */}
      <AnimatePresence>
        {isDisqualified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/95 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900/95 p-8 text-center shadow-[0_0_60px_-10px_rgba(244,63,94,0.6)]"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/40">
                <ShieldAlert className="h-7 w-7 text-rose-400" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-white">
                Test Auto-Submitted
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                You reached {MAX_INFRACTIONS} tab-switch infractions. Your
                test has been submitted automatically to enforce exam
                compliance.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Redirecting to the leaderboard…
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
