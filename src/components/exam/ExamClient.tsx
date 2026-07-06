"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  EXAM_DURATION_SECONDS,
  EXAM_QUESTIONS,
  formatTestTitle,
  type OptionLabel,
} from "@/lib/exam/mock-exam";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { QuestionViewer } from "@/components/exam/QuestionViewer";
import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { NavigationDeck } from "@/components/exam/NavigationDeck";
import { SubmitConfirmModal } from "@/components/exam/SubmitConfirmModal";
import { ExamCompletedScreen } from "@/components/exam/ExamCompletedScreen";

interface ExamClientProps {
  testId: string;
}

interface SubmissionResult {
  autoSubmitted: boolean;
}

export function ExamClient({ testId }: ExamClientProps) {
  const title = formatTestTitle(testId);
  const totalQuestions = EXAM_QUESTIONS.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(
    new Set(),
  );
  const [secondsRemaining, setSecondsRemaining] = useState(
    EXAM_DURATION_SECONDS,
  );
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);

  const currentQuestion = EXAM_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  useEffect(() => {
    if (submission) return;
    const interval = setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [submission]);

  useEffect(() => {
    if (secondsRemaining === 0 && !submission) {
      setSubmission({ autoSubmitted: true });
    }
  }, [secondsRemaining, submission]);

  const handleSelectOption = (label: OptionLabel) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handleToggleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleSaveNext = () => {
    if (isLastQuestion) {
      setIsSubmitModalOpen(true);
      return;
    }
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  };

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setSubmission({ autoSubmitted: false });
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const unansweredCount = totalQuestions - answeredCount;

  if (submission) {
    return (
      <ExamCompletedScreen
        title={title}
        autoSubmitted={submission.autoSubmitted}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        totalQuestions={totalQuestions}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <ExamHeader
        title={title}
        secondsRemaining={secondsRemaining}
        onSubmitClick={() => setIsSubmitModalOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-8 pt-6 lg:flex-row lg:px-8">
        <QuestionViewer
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedOption={answers[currentIndex]}
          onSelectOption={handleSelectOption}
        />
        <QuestionPalette
          questions={EXAM_QUESTIONS}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelect={setCurrentIndex}
        />
      </div>

      <NavigationDeck
        hasAnswer={Boolean(answers[currentIndex])}
        isMarked={markedForReview.has(currentIndex)}
        isLastQuestion={isLastQuestion}
        onClear={handleClearResponse}
        onToggleMarkForReview={handleToggleMarkForReview}
        onSaveNext={handleSaveNext}
      />

      <AnimatePresence>
        {isSubmitModalOpen && (
          <SubmitConfirmModal
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            markedCount={markedCount}
            onCancel={() => setIsSubmitModalOpen(false)}
            onConfirm={handleConfirmSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
