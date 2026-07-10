"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  BookOpen,
  ChevronDown,
  Library,
  Rss,
  Sparkles,
} from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { ResourceCard } from "@/components/library/ResourceCard";
import type { LibraryResource } from "@/lib/library/types";

interface PublicReadingHomeProps {
  featuredResources: LibraryResource[];
  isConfigured: boolean;
}

/** The public "/" landing experience: a guest-facing reading and practice
 * platform, no sign-in required. Only real, database-backed content is
 * shown (a preview of actual `library_catalog()` resources) — Current
 * Affairs and AI Guru are presented as live practice/chat destinations,
 * not fabricated article snippets, since this app has no articles/blog
 * content model to draw from. */
export function PublicReadingHome({ featuredResources, isConfigured }: PublicReadingHomeProps) {
  return (
    <div className="glow-field flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
              <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              TestPulse <span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <Link
            href="/portal"
            className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_32px_-4px_rgba(6,182,212,0.9)]"
          >
            Institute Workspace
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-20 pb-16 text-center lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Free to explore — no sign-in required
          </motion.div>

          <div className="relative mx-auto mt-10 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30"
            />
            <motion.span
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-cyan-500/20"
            />
            <motion.span
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-10 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/40"
            />
            <Activity className="relative h-10 w-10 text-cyan-400" strokeWidth={2} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-glow mx-auto mt-8 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Read. Practice. Ask <span className="text-cyan-400">AI</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Browse chapter notes and books, practice Current Affairs, and
            chat with an AI tutor — open to everyone, no account needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/portal"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_45px_-4px_rgba(6,182,212,0.9)]"
            >
              Go to Institute Workspace / Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#featured-reads"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
            >
              Start reading
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </section>

        {/* Featured reads — real library_catalog() resources */}
        <section id="featured-reads" className="px-6 pb-4 lg:px-8">
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
                  Reading Room
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Featured chapter notes &amp; books
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

            {!isConfigured && (
              <p className="mt-8 text-sm text-slate-600">
                Supabase isn&apos;t configured in this environment, so the
                library preview can&apos;t load — this is expected in
                local/preview setups without env vars set.
              </p>
            )}

            {isConfigured && featuredResources.length === 0 && (
              <p className="mt-8 text-sm text-slate-600">
                No resources have been published to the library yet.
              </p>
            )}

            {featuredResources.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredResources.map((resource, index) => (
                  <ResourceCard key={resource.id} resource={resource} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Current Affairs + AI Guru — live practice/chat, not fabricated articles */}
        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="card-glow group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_45px_-10px_rgba(245,158,11,0.5)]"
            >
              <CornerBrackets colorClass="text-amber-400" />
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30">
                <Rss className="h-6 w-6 text-amber-400" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">Practice Current Affairs</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-400">
                Timed, subject-wise Current Affairs exams with instant
                scoring — a fast way to test what you know before you commit
                to an institute.
              </p>
              <Link
                href="/exams/current-affairs"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
              >
                Practice now
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-glow group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_45px_-10px_rgba(139,92,246,0.5)]"
            >
              <CornerBrackets colorClass="text-violet-400" />
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                <Bot className="h-6 w-6 text-violet-400" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">Ask AI Guru</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-400">
                A real AI chat tutor you can ask questions to right now,
                tuned for step-by-step academic help — not a generic
                chatbot.
              </p>
              <Link
                href="/ai-guru"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 transition-colors hover:text-violet-300"
              >
                Chat with AI Guru
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 pb-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="card-glow relative mx-auto flex max-w-4xl flex-col items-center gap-4 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/60 px-8 py-12 text-center backdrop-blur-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Part of an institute? Your workspace is one click away.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Students get their timetable, homework, and exam history.
              Admins get attendance, the fees ledger, and exam deployment —
              all built on your institute&apos;s real data.
            </p>
            <Link
              href="/portal"
              className="group mt-2 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_45px_-4px_rgba(6,182,212,0.9)]"
            >
              Go to Institute Workspace / Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            </span>
            <span className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} TestPulse AI. Built for schools and coaching institutes.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
            <Link href="/library" className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-400">
              <Library className="h-3.5 w-3.5" />
              Library
            </Link>
            <Link href="/exams" className="inline-flex items-center gap-1.5 transition-colors hover:text-amber-400">
              <Rss className="h-3.5 w-3.5" />
              Exam Arena
            </Link>
            <Link href="/ai-guru" className="inline-flex items-center gap-1.5 transition-colors hover:text-violet-400">
              <Bot className="h-3.5 w-3.5" />
              AI Guru
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
