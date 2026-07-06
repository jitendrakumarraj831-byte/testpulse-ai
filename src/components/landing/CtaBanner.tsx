"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="glow-field relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-8 py-16 text-center sm:px-16"
      >
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Give your next batch the exam edge —{" "}
          <span className="text-cyan-400">today</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
          Set up your institute&apos;s portal in under 15 minutes. No credit
          card required to start.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
      </motion.div>
    </section>
  );
}
