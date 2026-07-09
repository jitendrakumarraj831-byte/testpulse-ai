"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Camera, CheckCircle2, Loader2, MessageCircle, Settings2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_INSTITUTE_SETTINGS, type InstituteSettings } from "@/lib/admin/settings";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; settings: InstituteSettings };

interface ToggleDef {
  key: keyof InstituteSettings;
  column: "ai_proctoring_enabled" | "whatsapp_reports_enabled";
  icon: typeof Camera;
  label: string;
  description: string;
}

const TOGGLES: ToggleDef[] = [
  {
    key: "aiProctoringEnabled",
    column: "ai_proctoring_enabled",
    icon: Camera,
    label: "AI Proctoring",
    description:
      "Tab-switch tracking and anti-cheat enforcement on every live exam session. Turning this off disables the anti-cheat engine platform-wide immediately.",
  },
  {
    key: "whatsappReportsEnabled",
    column: "whatsapp_reports_enabled",
    icon: MessageCircle,
    label: "WhatsApp Parent Reports",
    description:
      "Governs whether parent score/rank reports would go out once the WhatsApp messaging integration is connected — no messages are sent yet, this only controls whether that pipeline is armed.",
  },
];

export function SystemSettingsPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    void client
      .from("institute_settings")
      .select("ai_proctoring_enabled, whatsapp_reports_enabled")
      .eq("id", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setState({ status: "ready", settings: DEFAULT_INSTITUTE_SETTINGS });
          return;
        }
        setState({
          status: "ready",
          settings: {
            aiProctoringEnabled: data.ai_proctoring_enabled,
            whatsappReportsEnabled: data.whatsapp_reports_enabled,
          },
        });
      });
  }, []);

  const toggle = async (toggleDef: ToggleDef) => {
    if (state.status !== "ready" || !supabase || savingKey) return;

    const nextValue = !state.settings[toggleDef.key];
    setSavingKey(toggleDef.key);
    setErrorMessage("");

    const { error } = await supabase
      .from("institute_settings")
      .update({ [toggleDef.column]: nextValue })
      .eq("id", true);

    if (error) {
      setErrorMessage(
        "Couldn't save that change — make sure you're signed in as an admin and try again.",
      );
      setSavingKey(null);
      return;
    }

    setState({
      status: "ready",
      settings: { ...state.settings, [toggleDef.key]: nextValue },
    });
    setSavingKey(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <Settings2 className="h-3.5 w-3.5" />
          System Settings
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Platform Controls
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          These toggles apply institute-wide, for every student and admin, the moment you flip them.
        </p>
      </motion.div>

      {state.status === "unconfigured" && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so settings can&apos;t load — this is
          expected in local/preview setups without env vars set.
        </p>
      )}

      {state.status === "loading" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="h-16 w-full animate-pulse rounded-lg bg-slate-800/70" />
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {state.status === "ready" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOGGLES.map((toggleDef) => {
            const isOn = state.settings[toggleDef.key];
            const isSaving = savingKey === toggleDef.key;
            return (
              <motion.div
                key={toggleDef.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`card-glow relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 ${
                  isOn ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-800 bg-slate-900/40"
                }`}
              >
                <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible={isOn} />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
                      <toggleDef.icon className="h-5 w-5 text-cyan-400" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white">{toggleDef.label}</p>
                      {isOn && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-label={`Toggle ${toggleDef.label}`}
                    disabled={isSaving}
                    onClick={() => void toggle(toggleDef)}
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 disabled:opacity-60 ${
                      isOn ? "border-cyan-500/50 bg-cyan-500/15" : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin text-cyan-300" />
                    ) : (
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                          isOn ? "left-6" : "left-1"
                        }`}
                      />
                    )}
                  </button>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">{toggleDef.description}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
