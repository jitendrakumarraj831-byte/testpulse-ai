"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  mapApiQuestionToGenerated,
  mapGeneratedToApiQuestion,
  type DifficultyLevel,
  type GenerateQuestionsResponse,
  type GeneratedQuestion,
  type PublishExamResponse,
} from "@/lib/admin/question-generator";
import { GeneratorForm } from "@/components/admin/GeneratorForm";
import { GenerationProgress } from "@/components/admin/GenerationProgress";
import { ResultsPanel } from "@/components/admin/ResultsPanel";

type Phase = "idle" | "generating" | "results";

export function AIGeneratorPanel() {
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("Rotational Dynamics");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");

  const [phase, setPhase] = useState<Phase>("idle");
  const [showValidation, setShowValidation] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startGeneration = async () => {
    if (!subject.trim() || !topic.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setIsPublished(false);
    setPublishedUrl(null);
    setPublishError(null);
    setErrorMessage(null);
    setPhase("generating");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          count: totalQuestions,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error ?? `Request failed with status ${response.status}`,
        );
      }

      const data: GenerateQuestionsResponse = await response.json();
      setQuestions(
        data.questions.map((question) =>
          mapApiQuestionToGenerated(question, { subject, topic, difficulty }),
        ),
      );
      setPhase("results");
    } catch (error) {
      console.error("Failed to generate questions:", error);
      setErrorMessage(
        "We couldn't generate questions right now. Please try again.",
      );
      setPhase("idle");
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await fetch("/api/exams/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${subject}: ${topic}`,
          subject,
          topic,
          difficulty,
          questions: questions.map(mapGeneratedToApiQuestion),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error ?? `Request failed with status ${response.status}`,
        );
      }

      const data: PublishExamResponse = await response.json();
      setPublishedUrl(data.url);
      setIsPublished(true);
    } catch (error) {
      console.error("Failed to publish exam:", error);
      setPublishError(
        "We couldn't publish this test right now. Please try again.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateAnother = () => {
    setPhase("idle");
    setQuestions([]);
    setIsPublished(false);
    setPublishedUrl(null);
    setPublishError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
      <GeneratorForm
        subject={subject}
        topic={topic}
        totalQuestions={totalQuestions}
        difficulty={difficulty}
        isGenerating={phase === "generating"}
        showValidation={showValidation}
        onSubjectChange={setSubject}
        onTopicChange={setTopic}
        onTotalQuestionsChange={setTotalQuestions}
        onDifficultyChange={setDifficulty}
        onGenerate={startGeneration}
      />

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {phase === "generating" && (
            <GenerationProgress key="progress" onComplete={() => {}} />
          )}
          {phase === "results" && (
            <ResultsPanel
              key="results"
              questions={questions}
              isPublishing={isPublishing}
              isPublished={isPublished}
              publishedUrl={publishedUrl}
              publishError={publishError}
              onRegenerate={startGeneration}
              onPublish={handlePublish}
              onCreateAnother={handleCreateAnother}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
