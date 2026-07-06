"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { StatCounter } from "@/components/student/StatCounter";

const STATS = [
  {
    label: "Active Exams Live",
    value: 128,
    icon: Zap,
  },
  {
    label: "Total Global Submissions",
    value: 42918,
    icon: Users,
  },
  {
    label: "AI Questions Generated",
    value: 316420,
    icon: TrendingUp,
  },
];

export function StudentHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-12 lg:px-8 lg:pt-24">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Live student network online
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-glow mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Empower Your <span className="text-cyan-400">Learning Journey</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          Pick a subject, drop into an AI-calibrated exam, and track your
          growth in real time — built for students who move fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="card-glow flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-6 backdrop-blur-md transition-shadow"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
                <stat.icon className="h-4.5 w-4.5 text-cyan-400" />
              </span>
              <span className="text-2xl font-bold text-white sm:text-3xl">
                <StatCounter value={stat.value} suffix="+" />
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
