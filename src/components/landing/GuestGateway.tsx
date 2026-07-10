"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { CorePillars } from "@/components/landing/CorePillars";

/** The logged-out "/portal" experience (the public "/" is a separate
 * guest-facing reading platform — see src/app/page.tsx): a product
 * showcase explaining the real, database-backed services (Student Academic
 * Hub, Management Suite & ERP, Exam Arena & AI Guru) with the two portal
 * entry points kept front and center — no invented stats, no external
 * pricing tiers, only what the platform actually does. Every feature item
 * links straight to its real page; gated ones (/student/*, /admin/*)
 * bounce a signed-out click to /auth/login and back via the shared
 * middleware, so no click here is ever a dead end. The logo link goes to
 * the public "/" reading platform, not back into this gateway. */
export function GuestGateway() {
  return (
    <div className="glow-field flex min-h-screen flex-col items-center bg-slate-950 px-5 py-10 sm:px-6 sm:py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5 sm:mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
          <Activity className="h-5.5 w-5.5 text-cyan-400" strokeWidth={2.25} />
        </span>
        <span className="text-xl font-semibold tracking-tight text-white">
          TestPulse <span className="text-cyan-400">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-2xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-glow text-2xl font-bold text-white sm:text-3xl"
        >
          One ecosystem for your entire institute
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base"
        >
          Timetables, chapter notes, attendance, fees, exams, and an AI tutor —
          students and administrators work from the same live data, in one
          platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <Link
            href="/auth/login?portal=student"
            className="card-glow group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="h-7 w-7 text-cyan-400" />
            </span>
            <p className="text-lg font-semibold text-white">Student Login</p>
            <p className="text-sm text-slate-500">Exams, schedule, homework, and your progress.</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/auth/login?portal=admin"
            className="card-glow group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_55px_-12px_rgba(139,92,246,0.6)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30 transition-transform duration-300 group-hover:scale-110">
              <ShieldCheck className="h-7 w-7 text-violet-400" />
            </span>
            <p className="text-lg font-semibold text-white">Admin Login</p>
            <p className="text-sm text-slate-500">Fees, attendance, students, and exam deployment.</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>
      </div>

      <div className="mt-12 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-slate-800 to-transparent sm:mt-16" />

      <div className="w-full">
        <CorePillars />
      </div>

      <p className="mt-4 text-center text-xs text-slate-600 sm:mt-6">
        &copy; {new Date().getFullYear()} TestPulse AI. Built for schools and coaching institutes.
      </p>
    </div>
  );
}
