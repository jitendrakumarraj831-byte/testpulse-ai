"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gem, Loader2, Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { awardLearningPoints, getRewardSummary, type RewardSummary } from "@/lib/student/rewards";

type LoadState =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "loading" }
  | { status: "ready"; summary: RewardSummary };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** The signed-in student's reward point vault: awards any newly-earned
 * points (daily activity + streak milestones, computed server-side from
 * their real submission history — see award_learning_points() in
 * supabase/schema.sql) on mount, then shows the resulting real balance and
 * recent award history. Utility points only — there's no redemption/spend
 * catalog yet, matching how Module 4.2's fee ledger is deliberately manual
 * with no payment gateway wired up. */
export function RewardVaultCard() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [justAwarded, setJustAwarded] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ status: "signed-out" });
        return;
      }

      const { pointsAwarded } = await awardLearningPoints(supabase);
      setJustAwarded(pointsAwarded);
      const summary = await getRewardSummary(supabase);
      setState({ status: "ready", summary });
    };

    void run();
  }, [supabase]);

  if (state.status === "unconfigured" || state.status === "signed-out") return null;

  if (state.status === "loading") {
    return (
      <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your reward vault…</span>
        </div>
      </div>
    );
  }

  const { summary } = state;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8"
    >
      <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30">
            <Gem className="h-8 w-8 text-violet-400" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              Reward Vault
            </p>
            <p className="text-4xl font-bold text-white">
              {summary.balance}
              <span className="ml-1.5 text-base font-medium text-slate-500">points</span>
            </p>
            {justAwarded > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                +{justAwarded} earned just now
              </p>
            )}
            {justAwarded === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Earned from daily learning activity and consistency streaks.
              </p>
            )}
          </div>
        </div>

        <div className="min-w-[220px] flex-1 space-y-2">
          {summary.events.length === 0 && (
            <p className="text-sm text-slate-500">
              Take a test today to start earning points.
            </p>
          )}
          {summary.events.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">{event.reason}</p>
                <p className="text-[11px] text-slate-600">{formatDate(event.createdAt)}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-violet-300">+{event.points}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
