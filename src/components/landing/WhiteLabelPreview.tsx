"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, GraduationCap, Palette, Sparkles } from "lucide-react";

const BRAND_PRESETS = [
  {
    id: "testpulse",
    label: "TestPulse AI (Default)",
    instituteName: "TestPulse AI",
    tagline: "The AI exam engine, unbranded",
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.12)",
    icon: Sparkles,
  },
  {
    id: "apex",
    label: "Apex Coaching Institute",
    instituteName: "Apex Coaching Institute",
    tagline: "Your Institute Branding Goes Here",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.12)",
    icon: GraduationCap,
  },
  {
    id: "summit",
    label: "Summit Academy",
    instituteName: "Summit Academy",
    tagline: "Your Institute Branding Goes Here",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.12)",
    icon: Building2,
  },
];

export function WhiteLabelPreview() {
  const [activeId, setActiveId] = useState(BRAND_PRESETS[0].id);
  const active =
    BRAND_PRESETS.find((preset) => preset.id === activeId) ?? BRAND_PRESETS[0];
  const Icon = active.icon;

  return (
    <section id="institutes" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            White-label, out of the box
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your institute&apos;s brand, not ours
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Every coaching institute gets a fully re-skinned portal — logo,
            colors, and banner copy swap instantly. Try it below.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {BRAND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActiveId(preset.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                preset.id === activeId
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              {preset.label}
            </button>
          ))}
        </div>

        <div className="card-glow relative mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div
                className="flex items-center justify-between border-b border-slate-800 px-6 py-4"
                style={{ backgroundColor: active.accentSoft }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: active.accentSoft,
                      boxShadow: `inset 0 0 0 1px ${active.accent}55`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: active.accent }} />
                  </span>
                  <span className="text-base font-semibold text-white">
                    {active.instituteName}
                  </span>
                </div>
                <span
                  className="hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-block"
                  style={{
                    backgroundColor: active.accentSoft,
                    color: active.accent,
                  }}
                >
                  Live Preview
                </span>
              </div>

              <div className="px-6 py-10 text-center sm:py-14">
                <p
                  className="text-xl font-bold tracking-tight sm:text-2xl"
                  style={{ color: active.accent }}
                >
                  {active.tagline}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
                  Powered by the same AI exam engine, dashboards, and
                  analytics underneath — students only ever see your name.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
