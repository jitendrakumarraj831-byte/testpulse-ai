import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase renamed "anon key" to "publishable key"; accept either
// depending on which naming was used when the project's env vars were set.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Real client when env vars are present, otherwise `null`. Callers must
 * check `isSupabaseConfigured` (or handle a null client) so builds and
 * local/preview environments without Supabase configured never crash.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        // Force every request this client makes to bypass any fetch
        // cache (Next.js's Data Cache patches the global fetch it's
        // called through) so reads are always live, never stale.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
