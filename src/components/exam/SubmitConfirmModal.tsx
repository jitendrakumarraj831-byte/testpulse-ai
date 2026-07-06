"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";

interface SubmitConfirmModalProps {
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmModal({
  answeredCount,
  unansweredCount,
  markedCount,
  onCancel,
  onConfirm,
}: SubmitConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="card-glow w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-white">Submit Test?</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Once submitted, you won&apos;t be able to change your responses.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
            <p className="text-xl font-bold text-emerald-400">
              {answeredCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">Answered</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-center">
            <p className="text-xl font-bold text-slate-300">
              {unansweredCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">Unanswered</p>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
            <p className="text-xl font-bold text-purple-400">
              {markedCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">For Review</p>
          </div>
        </div>

        {(unansweredCount > 0 || markedCount > 0) && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            You still have {unansweredCount} unanswered and {markedCount}{" "}
            marked-for-review question{markedCount === 1 ? "" : "s"}.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
          >
            Keep Reviewing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_35px_-4px_rgba(6,182,212,0.95)]"
          >
            <Send className="h-4 w-4" />
            Confirm Submit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
