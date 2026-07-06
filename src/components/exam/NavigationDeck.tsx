"use client";

import { motion } from "framer-motion";
import { BookmarkCheck, RotateCcw, Send, SkipForward } from "lucide-react";

interface NavigationDeckProps {
  hasAnswer: boolean;
  isMarked: boolean;
  isLastQuestion: boolean;
  onClear: () => void;
  onToggleMarkForReview: () => void;
  onSaveNext: () => void;
}

export function NavigationDeck({
  hasAnswer,
  isMarked,
  isLastQuestion,
  onClear,
  onToggleMarkForReview,
  onSaveNext,
}: NavigationDeckProps) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-4 py-3 sm:gap-3 sm:px-8">
        <button
          type="button"
          onClick={onClear}
          disabled={!hasAnswer}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-700 bg-white/5 px-2 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-row sm:gap-2 sm:text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Response
        </button>

        <button
          type="button"
          onClick={onToggleMarkForReview}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors sm:flex-row sm:gap-2 sm:text-sm ${
            isMarked
              ? "border-purple-500/60 bg-purple-500/15 text-purple-300"
              : "border-slate-700 bg-white/5 text-slate-300 hover:border-purple-500/40 hover:text-purple-300"
          }`}
        >
          <BookmarkCheck className="h-4 w-4" />
          {isMarked ? "Marked for Review" : "Mark for Review"}
        </button>

        <motion.button
          type="button"
          onClick={onSaveNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-cyan-500 px-2 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_28px_-2px_rgba(6,182,212,0.9)] sm:flex-row sm:gap-2 sm:text-sm"
        >
          {isLastQuestion ? (
            <>
              <Send className="h-4 w-4" />
              Submit Test
            </>
          ) : (
            <>
              <SkipForward className="h-4 w-4" />
              Save &amp; Next
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
