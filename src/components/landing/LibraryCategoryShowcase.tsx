"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Atom,
  Calculator,
  FlaskConical,
  Landmark,
  Dna,
  Cpu,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface LibraryCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
  hoverBorder: string;
}

/** A visual showcase of the subject areas the reading room is organized
 * around. These cards are illustrative navigation into /library, not a
 * live count of what's published — the real, database-backed resource
 * list lives in the "Featured chapter notes & books" section below, drawn
 * from `library_catalog()`. */
const LIBRARY_SHOWCASE: LibraryCategory[] = [
  {
    icon: Atom,
    title: "Physics",
    description: "Mechanics, electromagnetism, and modern physics chapter notes.",
    accent: "text-cyan-400",
    iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
    hoverBorder: "hover:border-cyan-500/40",
  },
  {
    icon: Calculator,
    title: "Mathematics",
    description: "Algebra, calculus, and geometry — worked through step by step.",
    accent: "text-violet-400",
    iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30",
    hoverBorder: "hover:border-violet-500/40",
  },
  {
    icon: FlaskConical,
    title: "Chemistry",
    description: "Organic, inorganic, and physical chemistry, chapter by chapter.",
    accent: "text-emerald-400",
    iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/40",
  },
  {
    icon: Dna,
    title: "Biology",
    description: "Botany, zoology, and human physiology notes and diagrams.",
    accent: "text-rose-400",
    iconBg: "bg-rose-500/10 ring-1 ring-rose-500/30",
    hoverBorder: "hover:border-rose-500/40",
  },
  {
    icon: Landmark,
    title: "Competitive Exams",
    description: "Current Affairs, reasoning, and general studies for entrance tests.",
    accent: "text-amber-400",
    iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30",
    hoverBorder: "hover:border-amber-500/40",
  },
  {
    icon: Cpu,
    title: "Computer Science",
    description: "Fundamentals, programming, and data structures for CS batches.",
    accent: "text-sky-400",
    iconBg: "bg-sky-500/10 ring-1 ring-sky-500/30",
    hoverBorder: "hover:border-sky-500/40",
  },
];

export function LibraryCategoryShowcase() {
  return (
    <section className="border-t border-slate-800/60 px-6 py-14 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Browse by subject
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              A reading room organized the way you study
            </h2>
          </div>
          <Link
            href="/library"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Browse the full library
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIBRARY_SHOWCASE.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <Link
                href="/library"
                className={`card-glow group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 ${category.hoverBorder}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${category.iconBg}`}
                >
                  <category.icon className={`h-5 w-5 ${category.accent}`} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">{category.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
