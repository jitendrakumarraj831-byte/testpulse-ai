import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase renamed "anon key" to "publishable key"; accept either
// depending on which naming was used when the project's env vars were set.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
