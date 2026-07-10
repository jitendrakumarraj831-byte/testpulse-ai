"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Bot, ChevronDown, Rss, Sparkles } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { ResourceCard } from "@/components/library/ResourceCard";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LibraryCategoryShowcase } from "@/components/landing/LibraryCategoryShowcase";
import { CorePillars } from "@/components/landing/CorePillars";
import { WhiteLabelPreview } from "@/components/landing/WhiteLabelPreview";
import { EnterpriseFeatures } from "@/components/landing/EnterpriseFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InstitutionPricing } from "@/components/landing/InstitutionPricing";
import { OfferBanner } from "@/components/landing/OfferBanner";
import type { LibraryResource } from "@/lib/library/types";
import type { PromotionalOffer } from "@/lib/offers/types";

interface PublicReadingHomeProps {
  featuredResources: LibraryResource[];
  activeOffers: PromotionalOffer[];
  isConfigured: boolean;
}

/** The public "/" landing experience: the full product story for a
 * logged-out visitor, whether they're a student who wants to read and
 * practice right now, or an institute evaluating the platform. Two kinds
 * of content sit side by side here on purpose:
 *  - Real, database-backed sections (featured resources, every /student
 *    and /admin deep-link in CorePillars) show only what the platform
 *    actually has and does — nothing invented.
 *  - The subject showcase grid and enterprise sections (features,
 *    white-label preview, pricing, how-it-works) are illustrative
 *    marketing content, clearly framed as navigation/explanation rather
 *    than live counts or stats.
 * The enterprise pitch previously lived at /product; it's folded back in
 * here so "/" carries the full depth of the platform before sign-in. */
export function PublicReadingHome({ featuredResources, activeOffers, isConfigured }: PublicReadingHomeProps) {
  return (
    <div className="glow-field flex min-h-screen flex-col bg-slate-950">
      <OfferBanner offers={activeOffers} />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-14 pb-12 text-center sm:pt-20 sm:pb-16 lg:px-8 lg:pt-28">
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

          <div className="relative mx-auto mt-8 flex h-32 w-32 items-center justify-center sm:mt-10 sm:h-48 sm:w-48">
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
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute inset-2 rounded-full border border-cyan-500/10"
            />
            <Activity className="relative h-10 w-10 text-cyan-400" strokeWidth={2} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-glow mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:mt-8 sm:text-5xl lg:text-6xl"
          >
            Read. Practice. Ask <span className="text-cyan-400">AI</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-5 sm:text-lg"
          >
            Browse chapter notes and books, practice Current Affairs, and chat
            with an AI tutor — open to everyone, no account needed. Behind it
            is the same platform institutes run their entire operation on:
            timetables and homework for students, attendance and fee ledgers
            for admins, and an AI exam engine for both.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row"
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

        {/* Subject showcase — illustrative navigation into /library */}
        <LibraryCategoryShowcase />

        {/* Featured reads — real library_catalog() resources */}
        <section
          id="featured-reads"
          className="scroll-mt-24 border-t border-slate-800/60 px-6 py-14 sm:py-20 lg:px-8"
        >
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
              <div className="card-glow mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-8 text-center backdrop-blur-md">
                <p className="text-sm text-slate-500">
                  Supabase isn&apos;t configured in this environment, so the
                  library preview can&apos;t load — this is expected in
                  local/preview setups without env vars set.
                </p>
              </div>
            )}

            {isConfigured && featuredResources.length === 0 && (
              <div className="card-glow mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-8 text-center backdrop-blur-md">
                <p className="text-sm text-slate-500">
                  No resources have been published to the library yet.
                </p>
              </div>
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
        <section className="border-t border-slate-800/60 px-6 py-14 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="card-glow group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 sm:p-7 hover:shadow-[0_0_45px_-10px_rgba(245,158,11,0.5)]"
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
              className="card-glow group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 sm:p-7 hover:shadow-[0_0_45px_-10px_rgba(139,92,246,0.5)]"
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

        {/* Core pillars — Student Academic Hub / Management Suite & ERP / Exam Arena & AI Guru */}
        <div className="border-t border-slate-800/60">
          <CorePillars
            eyebrow="One platform, three real systems"
            title="Everything your institute runs on"
            id="platform"
          />
        </div>

        {/* White-label preview for institutes */}
        <div className="border-t border-slate-800/60">
          <WhiteLabelPreview />
        </div>

        {/* Enterprise feature grid */}
        <div className="border-t border-slate-800/60">
          <EnterpriseFeatures />
        </div>

        {/* Institute onboarding flow */}
        <HowItWorks />

        {/* Pricing */}
        <div className="border-t border-slate-800/60">
          <InstitutionPricing />
        </div>

        {/* Closing CTA */}
        <section className="border-t border-slate-800/60 px-6 py-14 sm:pb-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="card-glow relative mx-auto flex max-w-4xl flex-col items-center gap-4 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 px-6 py-10 text-center backdrop-blur-md sm:px-8 sm:py-12"
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
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/portal"
                className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_45px_-4px_rgba(6,182,212,0.9)]"
              >
                Go to Institute Workspace / Login
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
              >
                See pricing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
