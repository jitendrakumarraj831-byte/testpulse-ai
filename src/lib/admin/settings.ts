import { supabase } from "@/lib/supabase";

export interface InstituteSettings {
  aiProctoringEnabled: boolean;
  whatsappReportsEnabled: boolean;
}

export const DEFAULT_INSTITUTE_SETTINGS: InstituteSettings = {
  aiProctoringEnabled: true,
  whatsappReportsEnabled: true,
};

interface InstituteSettingsRow {
  ai_proctoring_enabled: boolean;
  whatsapp_reports_enabled: boolean;
}

/** Reads the single institute-wide settings row. Safe to call from both
 * server and client code, and from anonymous sessions (readable by anyone —
 * see the RLS policy in schema.sql) — falls back to the defaults if
 * Supabase isn't configured or the row can't be read for any reason. */
export async function getInstituteSettings(): Promise<InstituteSettings> {
  if (!supabase) return DEFAULT_INSTITUTE_SETTINGS;

  const { data, error } = await supabase
    .from("institute_settings")
    .select("ai_proctoring_enabled, whatsapp_reports_enabled")
    .eq("id", true)
    .maybeSingle<InstituteSettingsRow>();

  if (error || !data) return DEFAULT_INSTITUTE_SETTINGS;

  return {
    aiProctoringEnabled: data.ai_proctoring_enabled,
    whatsappReportsEnabled: data.whatsapp_reports_enabled,
  };
}
