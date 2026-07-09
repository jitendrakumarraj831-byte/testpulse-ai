"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Cpu,
  GraduationCap,
  MessageCircle,
  Radar,
  type LucideIcon,
} from "lucide-react";

interface ModuleAccent {
  iconBg: string;
  iconText: string;
  hoverBorder: string;
  hoverShadow: string;
  cta: string;
  statDot: string;
}

interface ModuleCard {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
  cta: string;
  accent: ModuleAccent;
}

const MODULES: ModuleCard[] = [
  {
    href: "/exams",
    icon: GraduationCap,
    eyebrow: "Student Zone",
    title: "Student Exam Panel",
    description:
      "Enter AI-calibrated exams across every subject, track scores in real time, and climb the live leaderboard.",
    stat: "128 exams live now",
    cta: "Launch Exam Panel",
    accent: {
      iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
      iconText: "text-cyan-400",
      hoverBorder: "hover:border-cyan-500/50",
      hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]",
      cta: "bg-cyan-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] group-hover:bg-cyan-400",
      statDot: "bg-cyan-400",
    },
  },
  {
    href: "/admin/ai-generator",
    icon: Cpu,
    eyebrow: "Institute Control",
    title: "Admin Suite",
    description:
      "Generate AI question papers, review and publish batches, and run your institute's entire exam operation.",
    stat: "AI engine online",
    cta: "Open Admin Suite",
    accent: {
      iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30",
      iconText: "text-violet-400",
      hoverBorder: "hover:border-violet-500/50",
      hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(139,92,246,0.6)]",
      cta: "bg-violet-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] group-hover:bg-violet-400",
      statDot: "bg-violet-400",
    },
  },
];

interface FeatureAccent {
  iconBg: string;
  iconText: string;
  track: string;
  glow: string;
  dot: string;
}

interface PremiumFeature {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  accent: FeatureAccent;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: "ai-proctoring",
    icon: Camera,
    label: "AI Proctoring",
    description:
      "Tab-switch tracking & anti-cheat behavior flags on every live exam session.",
    accent: {
      iconBg: "bg-rose-500/10 ring-1 ring-rose-500/30",
      iconText: "text-rose-400",
      track: "border-rose-500/50 bg-rose-500/15",
      glow: "shadow-[0_0_24px_-6px_rgba(244,63,94,0.7)]",
      dot: "bg-rose-400",
    },
  },
  {
    id: "whatsapp-reports",
    icon: MessageCircle,
    label: "WhatsApp Parent Reports",
    description:
      "Auto-sends score, rank & weak-topic summaries the moment a test is graded.",
    accent: {
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
      iconText: "text-emerald-400",
      track: "border-emerald-500/50 bg-emerald-500/15",
      glow: "shadow-[0_0_24px_-6px_rgba(16,185,129,0.7)]",
      dot: "bg-emerald-400",
    },
  },
];

function CornerBrackets({ colorClass }: { colorClass: string }) {
  const shared = `pointer-events-none absolute h-4 w-4 ${colorClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`;
  return (
    <>
      <span className={`${shared} top-3 left-3 border-t-2 border-l-2`} />
      <span className={`${shared} top-3 right-3 border-t-2 border-r-2`} />
      <span className={`${shared} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${shared} bottom-3 right-3 border-b-2 border-r-2`} />
    </>
  );
}

export function CommandDeck() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "ai-proctoring": true,
    "whatsapp-reports": true,
  });

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <section id="dashboard" className="glow-field relative px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            All systems online
          </div>
          <h2 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Command Deck
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            One dashboard, every module. Jump into the student exam zone or
            take the controls of your institute&apos;s AI admin suite.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {MODULES.map((module, index) => (
            <motion.div
              key={module.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link
                href={module.href}
                className={`card-glow relative block h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 ${module.accent.hoverBorder} ${module.accent.hoverShadow}`}
              >
                <CornerBrackets colorClass={module.accent.iconText} />

                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${module.accent.iconBg}`}
                  >
                    <module.icon className={`h-7 w-7 ${module.accent.iconText}`} />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${module.accent.statDot}`} />
                    {module.stat}
                  </span>
                </div>

                <p
                  className={`mt-6 text-xs font-semibold uppercase tracking-widest ${module.accent.iconText}`}
                >
                  {module.eyebrow}
                </p>
                <h3 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {module.description}
                </p>

                <div
                  className={`mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${module.accent.cta}`}
                >
                  {module.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-glow relative mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Radar className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white sm:text-lg">
                Premium Systems
              </h3>
            </div>
            <span className="rounded-full border border-slate-700 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {activeCount}/{PREMIUM_FEATURES.length} active
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            Flip a switch to preview what your teachers see the instant a
            premium feature goes live.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PREMIUM_FEATURES.map((feature) => {
              const isOn = enabled[feature.id];
              return (
                <div
                  key={feature.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-300 ${
                    isOn
                      ? `${feature.accent.track} ${feature.accent.glow}`
                      : "border-slate-800 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.accent.iconBg}`}
                    >
                      <feature.icon className={`h-5 w-5 ${feature.accent.iconText}`} />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white">
                          {feature.label}
                        </p>
                        {isOn && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span
                              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${feature.accent.dot}`}
                            />
                            <span
                              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${feature.accent.dot}`}
                            />
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-label={`Toggle ${feature.label}`}
                    onClick={() =>
                      setEnabled((prev) => ({ ...prev, [feature.id]: !prev[feature.id] }))
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 ${
                      isOn ? feature.accent.track : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                        isOn ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
