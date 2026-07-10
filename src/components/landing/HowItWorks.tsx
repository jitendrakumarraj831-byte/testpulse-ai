"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Rocket, Users, LayoutGrid, type LucideIcon } from "lucide-react";

interface OnboardingStep {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Create your institute workspace",
    description:
      "An admin signs up and sets the institute profile — name, branding, and the batches the institute runs.",
  },
  {
    icon: Users,
    step: "02",
    title: "Add staff & enroll students",
    description:
      "Invite teachers and front-office staff, then add students into their batches so every dashboard has real data from day one.",
  },
  {
    icon: LayoutGrid,
    step: "03",
    title: "Build the timetable & library",
    description:
      "Schedule classes and exams, and publish chapter notes, books, and catalogs to the reading room students see immediately.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Go live",
    description:
      "Students sign in to their schedule, homework, and Exam Arena. Admins run attendance and the fees ledger. AI Guru is on for both, right away.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-slate-800/60 px-6 py-14 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            From sign-up to a live institute, in four steps
          </h2>
          <p className="mt-4 text-base text-slate-400">
            The same rollout every institute follows to get staff and students onto real, working dashboards.
          </p>
        </motion.div>

        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-11 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent lg:block" />

          {ONBOARDING_STEPS.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-glow relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </span>
                <span className="text-2xl font-bold text-slate-800">{item.step}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
