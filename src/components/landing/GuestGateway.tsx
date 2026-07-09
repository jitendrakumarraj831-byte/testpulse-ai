"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LineChart,
  Receipt,
  ShieldCheck,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  detail: string;
  /** Only set when the underlying page is reachable without signing in
   * (e.g. /library, /exams, /ai-guru) — gated features like attendance or
   * the fees ledger deliberately have no href. */
  href?: string;
  linkLabel?: string;
}

interface ServicePillar {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  accent: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverShadow: string;
  };
  items: ServiceItem[];
}

const SERVICE_PILLARS: ServicePillar[] = [
  {
    icon: GraduationCap,
    eyebrow: "For Students",
    title: "Student Academic Hub",
    description:
      "A single workspace built directly on each student's own enrollment data — timetable, study material, and homework, all in one place.",
    accent: {
      iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
      iconText: "text-cyan-400",
      hoverBorder: "hover:border-cyan-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(6,182,212,0.5)]",
    },
    items: [
      {
        icon: Calendar,
        title: "Timetable & virtual classes",
        detail:
          "See every upcoming lecture, exam, and event for your batch, with a one-tap join link when a class goes live.",
      },
      {
        icon: BookOpen,
        title: "Chapter notes & digital library",
        detail:
          "Browse subject-wise chapter notes, books, and premium catalogs curated for your institute's reading room.",
        href: "/library",
        linkLabel: "Browse the library",
      },
      {
        icon: ClipboardList,
        title: "Homework & assignments",
        detail:
          "Track due dates, submit written responses or links, and see grades and teacher feedback the moment they're posted.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "For Institutes",
    title: "Management Suite & ERP",
    description:
      "The daily operations of a school or coaching institute, backed by real records — attendance, fees, and results, not spreadsheets.",
    accent: {
      iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30",
      iconText: "text-violet-400",
      hoverBorder: "hover:border-violet-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(139,92,246,0.5)]",
    },
    items: [
      {
        icon: CheckCircle2,
        title: "Daily attendance",
        detail:
          "Mark Present, Late, or Absent per batch each day — students see their live attendance percentage and full day-by-day history.",
      },
      {
        icon: Wallet,
        title: "Fees ledger & receipts",
        detail:
          "Log every payment — cash, bank transfer, UPI, or cheque — against a student's fee period, with an auto-generated receipt number.",
      },
      {
        icon: Receipt,
        title: "Printable receipts",
        detail:
          "Every logged payment produces a ready-to-print receipt, so front-office staff never have to draft one by hand.",
      },
    ],
  },
  {
    icon: Zap,
    eyebrow: "For Exams",
    title: "Exam Arena & AI Guru",
    description:
      "AI does the heavy lifting on both sides of the exam — drafting question banks for admins, and solving doubts for students.",
    accent: {
      iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30",
      iconText: "text-amber-400",
      hoverBorder: "hover:border-amber-500/40",
      hoverShadow: "hover:shadow-[0_0_45px_-10px_rgba(245,158,11,0.5)]",
    },
    items: [
      {
        icon: Bot,
        title: "AI question generator",
        detail:
          "Admins pick subject, topic, difficulty, and question count — the engine drafts a full question bank to review, edit, and publish.",
      },
      {
        icon: LineChart,
        title: "Timed subject exams",
        detail:
          "Enter live, subject-wise exams with instant scoring, and every graded exam rolls into your running score history.",
        href: "/exams",
        linkLabel: "Enter Exam Arena",
      },
      {
        icon: Bot,
        title: "AI Guru doubt-solving",
        detail:
          "A real AI chat tutor you can ask questions to any time, tuned for step-by-step academic help — not a generic chatbot.",
        href: "/ai-guru",
        linkLabel: "Chat with AI Guru",
      },
    ],
  },
];

/** The logged-out "/" experience: a product showcase explaining the real,
 * database-backed services (Student Academic Hub, Management Suite & ERP,
 * Exam Arena & AI Guru) with the two portal entry points kept front and
 * center — no invented stats, no external pricing tiers, only what the
 * platform actually does. Feature items that are reachable without signing
 * in link straight through to the live page. */
export function GuestGateway() {
  return (
    <div className="glow-field flex min-h-screen flex-col items-center bg-slate-950 px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5">
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

      <div className="mt-20 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            What TestPulse AI actually does
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Three systems, one shared database
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SERVICE_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`card-glow flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 ${pillar.accent.hoverBorder} ${pillar.accent.hoverShadow}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${pillar.accent.iconBg}`}
              >
                <pillar.icon className={`h-6 w-6 ${pillar.accent.iconText}`} />
              </span>
              <p className={`mt-5 text-xs font-semibold uppercase tracking-widest ${pillar.accent.iconText}`}>
                {pillar.eyebrow}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{pillar.description}</p>

              <ul className="mt-6 flex-1 space-y-5">
                {pillar.items.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${pillar.accent.iconText}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.detail}</p>
                      {item.href && (
                        <Link
                          href={item.href}
                          className={`group/link mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${pillar.accent.iconText} transition-colors hover:brightness-125`}
                        >
                          {item.linkLabel}
                          <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="mt-16 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} TestPulse AI. Built for schools and coaching institutes.
      </p>
    </div>
  );
}
