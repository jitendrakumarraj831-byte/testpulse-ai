import type { createClient } from "@/utils/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

export interface RewardEvent {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface RewardSummary {
  balance: number;
  events: RewardEvent[];
}

interface RewardLedgerRow {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

interface AwardResultRow {
  points_awarded: number;
  new_awards: number;
}

export function emptyRewardSummary(): RewardSummary {
  return { balance: 0, events: [] };
}

/** Recomputes and stores any newly-earned reward points for the signed-in
 * student (via the `award_learning_points` security-definer function — see
 * supabase/schema.sql), then returns how many points/awards were newly
 * granted by *this* call. Idempotent: calling it repeatedly (every
 * dashboard load, after every test submission) never double-awards. */
export async function awardLearningPoints(
  supabase: SupabaseClient,
): Promise<{ pointsAwarded: number; newAwards: number }> {
  const { data, error } = await supabase.rpc("award_learning_points");
  if (error || !data || data.length === 0) {
    return { pointsAwarded: 0, newAwards: 0 };
  }
  const row = data[0] as AwardResultRow;
  return { pointsAwarded: row.points_awarded, newAwards: row.new_awards };
}

/** The signed-in student's real reward point balance and recent award
 * history, read directly from `reward_points_ledger` (RLS scopes every
 * row to `auth.uid()` already, so no student_id filter is needed here). */
export async function getRewardSummary(supabase: SupabaseClient): Promise<RewardSummary> {
  const { data, error } = await supabase
    .from("reward_points_ledger")
    .select("id, points, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return emptyRewardSummary();

  const rows = data as RewardLedgerRow[];
  const balance = rows.reduce((sum, row) => sum + row.points, 0);
  const events: RewardEvent[] = rows.map((row) => ({
    id: row.id,
    points: row.points,
    reason: row.reason,
    createdAt: row.created_at,
  }));

  return { balance, events };
}
