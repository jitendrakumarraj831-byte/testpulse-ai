import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";

interface RankDeltaProps {
  rank: number;
  previousRank: number | null;
  /** Compact icon-only mode for tight spaces (podium cards); default shows a labeled pill. */
  compact?: boolean;
}

export function RankDelta({ rank, previousRank, compact = false }: RankDeltaProps) {
  if (previousRank === null) {
    return (
      <span
        title="First submission on this board"
        className={`inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-300 ${
          compact ? "px-1.5" : ""
        }`}
      >
        <Sparkles className="h-3 w-3" />
        {!compact && "NEW"}
      </span>
    );
  }

  const delta = previousRank - rank;

  if (delta === 0) {
    return (
      <span
        title="Holding position"
        className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-bold text-slate-400"
      >
        <Minus className="h-3 w-3" />
        {!compact && "—"}
      </span>
    );
  }

  if (delta > 0) {
    return (
      <span
        title={`Up ${delta} spot${delta === 1 ? "" : "s"} since their last submission`}
        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400"
      >
        <ArrowUp className="h-3 w-3" />
        {!compact && delta}
      </span>
    );
  }

  return (
    <span
      title={`Down ${Math.abs(delta)} spot${Math.abs(delta) === 1 ? "" : "s"} since their last submission`}
      className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400"
    >
      <ArrowDown className="h-3 w-3" />
      {!compact && Math.abs(delta)}
    </span>
  );
}
