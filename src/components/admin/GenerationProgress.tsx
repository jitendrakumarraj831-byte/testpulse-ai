"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { GENERATION_STEPS } from "@/lib/admin/question-generator";

interface GenerationProgressProps {
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 3200;
const TICK_MS = 60;

export function GenerationProgress({ onComplete }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const increment = (100 / TOTAL_DURATION_MS) * TICK_MS;
    const interval = setInterval(() => {
      setProgress((current) => Math.min(100, current + increment));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const timeout = setTimeout(() => onCompleteRef.current(), 450);
    return () => clearTimeout(timeout);
  }, [progress]);

  const activeStepIndex = Math.min(
    GENERATION_STEPS.length - 1,
    Math.floor((progress / 100) * GENERATION_STEPS.length),
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8"
    >
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <div>
          <h2 className="text-base font-semibold text-white">
            Generating your exam…
          </h2>
          <p className="text-sm text-slate-500">
            TestPulse AI is drafting questions tailored to your parameters.
          </p>
        </div>
      </div>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs font-medium text-cyan-400">
        {Math.round(progress)}%
      </p>

      <ol className="mt-6 space-y-4">
        {GENERATION_STEPS.map((step, index) => {
          const isDone = index < activeStepIndex || progress >= 100;
          const isActive = index === activeStepIndex && progress < 100;

          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isDone
                    ? "border-cyan-500 bg-cyan-500 text-slate-950"
                    : isActive
                      ? "border-cyan-500 text-cyan-400"
                      : "border-slate-700 text-slate-600"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDone ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pending"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[11px] font-semibold"
                    >
                      {index + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={`text-sm transition-colors ${
                  isDone || isActive ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {step}
              </span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              )}
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
