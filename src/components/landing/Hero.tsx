"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

const STATS = [
  { value: "500+", label: "Coaching institutes onboarded" },
  { value: "2.4M+", label: "AI-generated questions served" },
  { value: "98.6%", label: "Auto-grading accuracy" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="glow-field relative overflow-hidden px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Purpose-built for coaching institutes &amp; educators
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Run exams your students{" "}
              <span className="text-glow bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                actually feel the pulse of
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              TestPulse AI turns your syllabus into exam-ready question banks
              in minutes, wraps it in a portal branded to your institute, and
              hands you the analytics to know exactly where every student
              stands — before the real exam does.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#create-account"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)]"
              >
                Create Institute Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#demo-quiz"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              >
                <PlayCircle className="h-4 w-4" />
                Explore Demo Quiz
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-800/80 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-cyan-500/10 blur-3xl" />
            <div className="card-glow overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Physics — Mock Exam #14
                </span>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-200">
                    Live Mock Exam
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    412 students live
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Q17 · Rotational Dynamics
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    A disc of mass M and radius R rolls without slipping. Find
                    its kinetic energy in terms of its linear velocity v.
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">Avg. Accuracy</p>
                    <p className="mt-1 text-xl font-bold text-white">86%</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">Weak Topic Flag</p>
                    <p className="mt-1 text-xl font-bold text-cyan-400">
                      Thermodynamics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
