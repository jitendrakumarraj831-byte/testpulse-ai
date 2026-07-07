"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardPaste,
  Link2,
  Loader2,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  DIFFICULTY_LEVELS,
  type ApiQuestion,
  type DifficultyLevel,
  type PublishExamResponse,
} from "@/lib/admin/question-generator";
import {
  rowsToParsedQuestions,
  type ParsedQuestionRow,
} from "@/lib/admin/question-parser";
import { parseSpreadsheetFile } from "@/lib/admin/file-parser";
import { QuestionDropZone } from "@/components/admin/QuestionDropZone";
import { QuestionValidationTable } from "@/components/admin/QuestionValidationTable";

export function UploadQuestionsPanel() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState<ParsedQuestionRow[]>([]);

  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsParsingFile(true);
    try {
      const sheetRows = await parseSpreadsheetFile(file);
      if (sheetRows.length === 0) {
        throw new Error("No rows found in that file.");
      }
      const parsed = rowsToParsedQuestions(sheetRows, {
        subject: subject.trim(),
        topic: topic.trim(),
      });
      setRows((current) => [...current, ...parsed]);
    } catch (error) {
      console.error("Failed to parse uploaded file:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't read that file. Please check the format and try again.",
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleParseWithAI = async () => {
    if (!rawText.trim()) {
      setErrorMessage("Paste some question text before parsing with AI.");
      return;
    }
    setErrorMessage(null);
    setIsParsingAI(true);
    try {
      const response = await fetch("/api/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error ?? `Request failed with status ${response.status}`,
        );
      }

      const data: { questions: ApiQuestion[]; source: "ai" | "heuristic" } =
        await response.json();

      const parsed: ParsedQuestionRow[] = data.questions.map((question, index) => ({
        rowId: `ai-row-${Date.now()}-${index}`,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        subject: subject.trim(),
        topic: topic.trim(),
        isValid: true,
        issues: [],
      }));

      setRows((current) => [...current, ...parsed]);
      setRawText("");
    } catch (error) {
      console.error("Failed to parse raw text:", error);
      setErrorMessage(
        "We couldn't parse that text right now. Please try again.",
      );
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.rowId !== rowId));
  };

  const handlePublish = async () => {
    const readyRows = rows.filter((row) => row.isValid);

    if (!subject.trim() || !topic.trim()) {
      setErrorMessage("Subject and Topic are required before publishing.");
      return;
    }
    if (readyRows.length === 0) {
      setErrorMessage("No validated rows are ready to import yet.");
      return;
    }

    setErrorMessage(null);
    setIsPublishing(true);
    try {
      const questions: ApiQuestion[] = readyRows.map((row, index) => ({
        id: index + 1,
        question: row.question,
        options: row.options,
        correctAnswer: row.correctAnswer!,
        explanation: row.explanation || "No explanation provided.",
      }));

      const response = await fetch("/api/exams/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${subject}: ${topic}`,
          subject,
          topic,
          difficulty,
          questions,
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
    } catch (error) {
      console.error("Failed to publish uploaded questions:", error);
      setErrorMessage(
        "We couldn't publish this batch right now. Please try again.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleStartNewBatch = () => {
    setRows([]);
    setRawText("");
    setPublishedUrl(null);
    setErrorMessage(null);
  };

  const readyCount = rows.filter((row) => row.isValid).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Bulk Question Uploader
            </h1>
            <p className="text-sm text-slate-500">
              Import from Excel, CSV, or raw pasted text — validate, then
              publish straight to the database.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label
              htmlFor="upload-subject"
              className="text-sm font-medium text-slate-300"
            >
              Subject
            </label>
            <input
              id="upload-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Physics"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="upload-topic"
              className="text-sm font-medium text-slate-300"
            >
              Topic / Chapter
            </label>
            <input
              id="upload-topic"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Rotational Dynamics"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="upload-difficulty"
              className="text-sm font-medium text-slate-300"
            >
              Difficulty
            </label>
            <select
              id="upload-difficulty"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as DifficultyLevel)
              }
              className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-slate-900">
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuestionDropZone isProcessing={isParsingFile} onFile={handleFile} />

        <div className="card-glow flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <label
            htmlFor="raw-text"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <ClipboardPaste className="h-4 w-4 text-cyan-400" />
            Paste raw question text
          </label>
          <textarea
            id="raw-text"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            disabled={isParsingAI}
            placeholder={`1. What is the capital of France?\nA) London\nB) Paris\nC) Berlin\nD) Madrid\nAnswer: B`}
            className="mt-3 min-h-32 flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <motion.button
            type="button"
            onClick={() => void handleParseWithAI()}
            disabled={isParsingAI}
            whileHover={isParsingAI ? undefined : { scale: 1.01 }}
            whileTap={isParsingAI ? undefined : { scale: 0.98 }}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isParsingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing with AI…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Parse with AI
              </>
            )}
          </motion.button>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      <div className="mt-6">
        <QuestionValidationTable rows={rows} onRemove={handleRemoveRow} />
      </div>

      {rows.length > 0 && (
        <div className="card-glow sticky bottom-4 mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-lg">
          {publishedUrl ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Published successfully.
                </p>
                <a
                  href={publishedUrl}
                  className="mt-1 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {publishedUrl}
                </a>
              </div>
              <button
                type="button"
                onClick={handleStartNewBatch}
                className="rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              >
                Start a New Batch
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                {readyCount} of {rows.length} rows ready to import.
              </p>
              <motion.button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isPublishing || readyCount === 0}
                whileHover={isPublishing ? undefined : { scale: 1.02 }}
                whileTap={isPublishing ? undefined : { scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Confirm & Publish to Database
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
