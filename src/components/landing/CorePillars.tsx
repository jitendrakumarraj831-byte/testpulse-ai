"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ClipboardList,
  BookOpen,
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
  /** Every item links straight to its real page. Gated destinations
   * (/student/*, /admin/*) already redirect a signed-out visitor to
   * /auth/login?redirect=<path> via src/utils/supabase/middleware.ts, then
   * bounce them right back after signing in — no extra auth handling
   * needed here. /library and /ai-guru stay open to guests by design. */
  href: string;
  linkLabel: string;
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

export const SERVICE_PILLARS: ServicePillar[] = [
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
        href: "/student/schedule",
        linkLabel: "View your timetable",
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
        href: "/student/assignments",
        linkLabel: "View assignments",
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
        href: "/admin/attendance",
        linkLabel: "Open attendance",
      },
      {
        icon: Wallet,
        title: "Fees ledger & receipts",
        detail:
          "Log every payment — cash, bank transfer, UPI, or cheque — against a student's fee period, with an auto-generated receipt number.",
        href: "/admin/fees",
        linkLabel: "Open fees ledger",
      },
      {
        icon: Receipt,
        title: "Printable receipts",
        detail:
          "Every logged payment produces a ready-to-print receipt, so front-office staff never have to draft one by hand.",
        href: "/admin/fees",
        linkLabel: "View receipts",
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
        href: "/admin/ai-generator",
        linkLabel: "Open AI generator",
      },
      {
        icon: LineChart,
        title: "Timed subject exams",
        detail:
          "Enter live, subject-wise exams with instant scoring, and every graded exam rolls into your running score history.",
        href: "/student/dashboard",
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

interface CorePillarsProps {
  eyebrow?: string;
  title?: string;
  id?: string;
}

/** The three real, database-backed pillars of the platform — Student
 * Academic Hub, Management Suite & ERP, and Exam Arena & AI Guru. Shared
 * between the logged-out /portal gateway (GuestGateway) and the public "/"
 * homepage so this content (and its real links) has one source of truth
 * instead of two copies drifting apart. */
export function CorePillars({
  eyebrow = "What TestPulse AI actually does",
  title = "Three systems, one shared database",
  id = "platform",
}: CorePillarsProps) {
  return (
    <section id={id} className="scroll-mt-24 px-6 py-14 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
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
              className={`card-glow flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 sm:p-7 ${pillar.accent.hoverBorder} ${pillar.accent.hoverShadow}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${pillar.accent.iconBg}`}
              >
                <pillar.icon className={`h-6 w-6 ${pillar.accent.iconText}`} />
              </span>
              <p className={`mt-4 text-xs font-semibold uppercase tracking-widest sm:mt-5 ${pillar.accent.iconText}`}>
                {pillar.eyebrow}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{pillar.description}</p>

              <ul className="mt-5 flex-1 space-y-4 sm:mt-6 sm:space-y-5">
                {pillar.items.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${pillar.accent.iconText}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.detail}</p>
                      <Link
                        href={item.href}
                        className={`group/link mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${pillar.accent.iconText} transition-colors hover:brightness-125`}
                      >
                        {item.linkLabel}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
