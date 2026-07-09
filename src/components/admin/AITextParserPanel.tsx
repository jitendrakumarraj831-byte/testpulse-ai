"use client";

import { motion } from "framer-motion";
import { ClipboardPaste, Loader2, Sparkles } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface AITextParserPanelProps {
  rawText: string;
  onRawTextChange: (value: string) => void;
  onParse: () => void;
  isParsing: boolean;
}

export function AITextParserPanel({
  rawText,
  onRawTextChange,
  onParse,
  isParsing,
}: AITextParserPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-slate-900/60 to-slate-950/80 p-6 shadow-[0_0_70px_-20px_rgba(6,182,212,0.4)] backdrop-blur-2xl sm:p-8"
    >
      <CornerBrackets colorClass="text-cyan-400/60" alwaysVisible />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <ClipboardPaste className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                AI Text Parser
              </p>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
            </div>
            <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
              Paste any paper. Get structured questions.
            </h2>
          </div>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
        Drop in raw text from a scanned worksheet, an old paper, or informally
        formatted notes — the AI engine extracts clean, validated
        multiple-choice questions in seconds. No spreadsheet formatting
        required.
      </p>

      <textarea
        value={rawText}
        onChange={(event) => onRawTextChange(event.target.value)}
        disabled={isParsing}
        placeholder={`1. What is the capital of France?\nA) London\nB) Paris\nC) Berlin\nD) Madrid\nAnswer: B`}
        className="mt-5 min-h-40 w-full resize-none rounded-xl border border-cyan-500/20 bg-slate-950/50 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none backdrop-blur-md transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <motion.button
        type="button"
        onClick={onParse}
        disabled={isParsing}
        whileHover={isParsing ? undefined : { scale: 1.01 }}
        whileTap={isParsing ? undefined : { scale: 0.98 }}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isParsing ? (
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
    </motion.section>
  );
}
