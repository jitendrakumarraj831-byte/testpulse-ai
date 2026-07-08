"use client";

import { motion } from "framer-motion";
import { BarChart3, Camera, MessageCircle, Printer, type LucideIcon } from "lucide-react";

interface EnterpriseFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverShadow: string;
  };
}

const ENTERPRISE_FEATURES: EnterpriseFeature[] = [
  {
    icon: Camera,
    title: "AI Proctoring & Anti-Cheat Engine",
    description:
      "Tab-switch tracking, copy-paste prevention, and behavior flags keep every remote exam session honest — no extra hardware required.",
    accent: {
      iconBg: "bg-rose-500/10 ring-1 ring-rose-500/30",
      iconText: "text-rose-400",
      hoverBorder: "hover:border-rose-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(244,63,94,0.5)]",
    },
  },
  {
    icon: MessageCircle,
    title: "Automated WhatsApp Report Cards",
    description:
      "The moment a test is graded, parents get a WhatsApp message with the score, rank, and weak-topic summary — zero manual follow-up.",
    accent: {
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
      iconText: "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(16,185,129,0.5)]",
    },
  },
  {
    icon: BarChart3,
    title: "AI-Driven Weakness Analytics",
    description:
      "Topic-wise diagnostic reports show teachers exactly where each student — and each batch — is losing marks, updated after every test.",
    accent: {
      iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
      iconText: "text-cyan-400",
      hoverBorder: "hover:border-cyan-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(6,182,212,0.5)]",
    },
  },
  {
    icon: Printer,
    title: "One-Click OMR & Print-Ready PDFs",
    description:
      "Generate scannable OMR sheets and print-ready question papers in one click — built for offline classrooms with no internet in the room.",
    accent: {
      iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30",
      iconText: "text-amber-400",
      hoverBorder: "hover:border-amber-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(245,158,11,0.5)]",
    },
  },
];

export function EnterpriseFeatures() {
  return (
    <section id="features" className="glow-field relative px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Built for schools & coaching institutes
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Enterprise features that run your exam operation
          </h2>
          <p className="mt-4 text-base text-slate-400">
            The tools your admin team and teachers actually need — proctoring,
            parent updates, diagnostics, and print workflows in one platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {ENTERPRISE_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`card-glow group flex items-start gap-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 ${feature.accent.hoverBorder} ${feature.accent.hoverShadow}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${feature.accent.iconBg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.accent.iconText}`} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
