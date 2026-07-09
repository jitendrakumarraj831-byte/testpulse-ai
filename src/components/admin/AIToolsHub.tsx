"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardPaste, Wand2, type LucideIcon } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface ToolCard {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  accent: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverShadow: string;
    cta: string;
  };
}

const TOOL_CARDS: ToolCard[] = [
  {
    href: "/admin/ai-generator",
    icon: Wand2,
    eyebrow: "Generate from scratch",
    title: "Smart AI Question Generator",
    description:
      "Input subject and chapter keywords to instantly build fully structured MCQ papers using Groq AI.",
    cta: "Open Generator",
    accent: {
      iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
      iconText: "text-cyan-400",
      hoverBorder: "hover:border-cyan-500/50",
      hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]",
      cta: "bg-cyan-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] group-hover:bg-cyan-400",
    },
  },
  {
    href: "/admin/upload-questions#ai-text-parser",
    icon: ClipboardPaste,
    eyebrow: "Extract from existing text",
    title: "Bulk Text Parser & Paper Extractor",
    description:
      "Drop raw text from worksheets or paste plain text exams to extract structured MCQs instantly.",
    cta: "Open Text Parser",
    accent: {
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
      iconText: "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/50",
      hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.6)]",
      cta: "bg-emerald-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(16,185,129,0.7)] group-hover:bg-emerald-400",
    },
  },
];

export function AIToolsHub() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          AI Tools
        </p>
        <h1 className="text-glow mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Every AI tool, one place
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-400">
          Build a new exam from a topic, or turn text you already have into
          one — pick your starting point below.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {TOOL_CARDS.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Link
              href={card.href}
              className={`card-glow relative block h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 ${card.accent.hoverBorder} ${card.accent.hoverShadow}`}
            >
              <CornerBrackets colorClass={card.accent.iconText} />

              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${card.accent.iconBg}`}
              >
                <card.icon className={`h-7 w-7 ${card.accent.iconText}`} />
              </span>

              <p
                className={`mt-6 text-xs font-semibold uppercase tracking-widest ${card.accent.iconText}`}
              >
                {card.eyebrow}
              </p>
              <h2 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {card.description}
              </p>

              <div
                className={`mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${card.accent.cta}`}
              >
                {card.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
