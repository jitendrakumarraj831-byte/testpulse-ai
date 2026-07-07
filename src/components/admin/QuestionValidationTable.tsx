"use client";

import { CheckCircle2, X, AlertTriangle } from "lucide-react";
import type { ParsedQuestionRow } from "@/lib/admin/question-parser";

interface QuestionValidationTableProps {
  rows: ParsedQuestionRow[];
  onRemove: (rowId: string) => void;
}

export function QuestionValidationTable({
  rows,
  onRemove,
}: QuestionValidationTableProps) {
  if (rows.length === 0) return null;

  const readyCount = rows.filter((row) => row.isValid).length;

  return (
    <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-white">
          Validation Summary
        </h3>
        <p className="text-xs font-medium text-slate-500">
          {readyCount} of {rows.length} rows ready to import
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Correct</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.rowId}
                className="border-b border-slate-800/60 last:border-0"
              >
                <td className="max-w-xs truncate px-6 py-3 text-slate-200">
                  {row.question || (
                    <span className="italic text-slate-600">
                      (no question text)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{row.subject || "—"}</td>
                <td className="px-4 py-3 text-slate-400">{row.topic || "—"}</td>
                <td className="px-4 py-3 font-semibold text-cyan-400">
                  {row.correctAnswer ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {row.isValid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready to Import
                    </span>
                  ) : (
                    <span
                      title={row.issues.join(", ")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Needs Review
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onRemove(row.rowId)}
                    aria-label="Remove row"
                    className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
