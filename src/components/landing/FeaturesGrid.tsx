"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Radio,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
}

const FEATURES: Feature[] = [
  {
    icon: BrainCircuit,
    title: "AI Exam Generator",
    description:
      "Upload a syllabus, chapter PDF, or topic list and get exam-ready MCQs, short answers, and full-length papers generated in seconds — mapped to difficulty and marking scheme.",
    highlight: "10x faster paper setting",
  },
  {
    icon: ShieldCheck,
    title: "White-Label Portal",
    description:
      "Launch a fully branded exam portal on your own domain — your logo, your colors, your institute's identity — with zero infrastructure to manage.",
    highlight: "Your brand, your domain",
  },
  {
    icon: BarChart3,
    title: "Student Analytics",
    description:
      "Track topic-wise accuracy, percentile ranks, and improvement trends for every student, batch, or center from a single real-time dashboard.",
    highlight: "Actionable weak-topic reports",
  },
  {
    icon: Radio,
    title: "Live Mock Exams",
    description:
      "Run proctored, timed mock exams at scale with live leaderboards, auto-submission, and instant result publishing the moment the clock hits zero.",
    highlight: "Real-time leaderboards",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Everything institutes need
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One platform to generate, brand, and analyze every exam
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Replace spreadsheets, third-party proctoring tools, and manual
            grading with a single AI-native workflow built for exam-heavy
            institutes.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="card-glow group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-colors group-hover:bg-cyan-500/20">
                <feature.icon
                  className="h-6 w-6 text-cyan-400"
                  strokeWidth={1.75}
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-medium text-slate-500">
                  {feature.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
