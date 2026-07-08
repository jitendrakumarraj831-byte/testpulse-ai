import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "@/utils/supabase/env";

export { isSupabaseConfigured };

/**
 * Real client when env vars are present, otherwise `null`. Callers must
 * check `isSupabaseConfigured` (or handle a null client) so builds and
 * local/preview environments without Supabase configured never crash.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        // Force every request this client makes to bypass any fetch
        // cache (Next.js's Data Cache patches the global fetch it's
        // called through) so reads are always live, never stale.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
