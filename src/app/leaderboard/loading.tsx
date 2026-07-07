"use client";

import { motion } from "framer-motion";

const SKELETON_ROWS = Array.from({ length: 8 }, (_, index) => index);

export default function LeaderboardLoading() {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-800/80" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded-lg bg-slate-800/60" />

        <div className="mt-8 flex gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-full bg-slate-800/70"
            />
          ))}
        </div>

        <div className="card-glow mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          {SKELETON_ROWS.map((row) => (
            <motion.div
              key={row}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: row * 0.08,
                ease: "easeInOut",
              }}
              className="flex items-center gap-4 border-b border-slate-800/60 px-6 py-4 last:border-0"
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800" />
              <div className="h-9 w-9 shrink-0 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/20" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded bg-slate-800" />
                <div className="h-3 w-20 rounded bg-slate-800/70" />
              </div>
              <div className="h-3.5 w-12 shrink-0 rounded bg-slate-800" />
              <div className="h-3.5 w-16 shrink-0 rounded bg-slate-800/70" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
