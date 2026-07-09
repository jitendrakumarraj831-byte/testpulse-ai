import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

/**
 * Service-role client for privileged operations (deleting a real Supabase
 * Auth user, etc.) that the anon/publishable key can never perform no
 * matter what RLS policy exists — Supabase's Admin API is gated on the
 * service-role key specifically.
 *
 * SERVER-ONLY. Never import this from a "use client" file or a component
 * that could end up in a client bundle — doing so would ship the
 * service-role key to the browser. It's only safe to import from Route
 * Handlers / Server Components / Server Actions.
 */
export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
