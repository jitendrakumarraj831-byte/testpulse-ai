"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  generateMockQuestions,
  type DifficultyLevel,
  type GeneratedQuestion,
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

  const startGeneration = () => {
    if (!subject.trim() || !topic.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setIsPublished(false);
    setPhase("generating");
  };

  const handleGenerationComplete = () => {
    setQuestions(
      generateMockQuestions({ subject, topic, totalQuestions, difficulty }),
    );
    setPhase("results");
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
    }, 900);
  };

  const handleCreateAnother = () => {
    setPhase("idle");
    setQuestions([]);
    setIsPublished(false);
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

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {phase === "generating" && (
            <GenerationProgress
              key="progress"
              onComplete={handleGenerationComplete}
            />
          )}
          {phase === "results" && (
            <ResultsPanel
              key="results"
              questions={questions}
              isPublishing={isPublishing}
              isPublished={isPublished}
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
