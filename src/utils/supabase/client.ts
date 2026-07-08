import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/utils/supabase/env";

export const createClient = () =>
  createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
