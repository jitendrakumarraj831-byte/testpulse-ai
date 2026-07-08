/**
 * Single source of truth for Supabase env var resolution, shared by every
 * client in this app (browser, server, middleware, and the plain
 * `lib/supabase.ts` client). Supabase renamed the "anon key" to the
 * "publishable key"; a Vercel project may still only have the older
 * NEXT_PUBLIC_SUPABASE_ANON_KEY set, so both names must be accepted
 * everywhere — not just in whichever client happened to be written last —
 * or data submission (student responses, demo requests) silently no-ops
 * depending on which client handles the request.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
