"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  GraduationCap,
  History,
  ListChecks,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface MetricCard {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  accent: string;
}

interface ActionCard {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  accent: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverShadow: string;
    cta: string;
  };
}

interface StudentDashboardViewProps {
  displayName: string;
  totalSubmissions: number;
  currentStreak: number;
  instituteRank: number | null;
  rankedStudentCount: number;
}

export function StudentDashboardView({
  displayName,
  totalSubmissions,
  currentStreak,
  instituteRank,
  rankedStudentCount,
}: StudentDashboardViewProps) {
  const metrics: MetricCard[] = [
    {
      key: "submissions",
      icon: ListChecks,
      label: "Total Submissions",
      value: totalSubmissions.toLocaleString(),
      hint: totalSubmissions === 0 ? "Take your first exam to get started" : "Exams completed",
      accent: "cyan",
    },
    {
      key: "streak",
      icon: Flame,
      label: "Current Active Streak",
      value: `${currentStreak} day${currentStreak === 1 ? "" : "s"}`,
      hint: currentStreak > 0 ? "Keep it alive — come back tomorrow" : "Submit today to start one",
      accent: "amber",
    },
    {
      key: "rank",
      icon: Trophy,
      label: "Institute Rank",
      value: instituteRank ? `#${instituteRank}` : "Unranked",
      hint:
        instituteRank && rankedStudentCount > 0
          ? `Out of ${rankedStudentCount.toLocaleString()} ranked students`
          : "Submit a test to enter the leaderboard",
      accent: "violet",
    },
  ];

  const accentClasses: Record<string, { iconBg: string; iconText: string }> = {
    cyan: { iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30", iconText: "text-cyan-400" },
    amber: { iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30", iconText: "text-amber-400" },
    violet: { iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30", iconText: "text-violet-400" },
  };

  const actions: ActionCard[] = [
    {
      href: "/exams",
      icon: GraduationCap,
      eyebrow: "Take a test",
      title: "Enter Exam Arena",
      description: "Jump into an AI-calibrated exam across any subject and climb the leaderboard.",
      cta: "Enter Arena",
      accent: {
        iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
        iconText: "text-cyan-400",
        hoverBorder: "hover:border-cyan-500/50",
        hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]",
        cta: "bg-cyan-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] group-hover:bg-cyan-400",
      },
    },
    {
      href: "/leaderboard",
      icon: Trophy,
      eyebrow: "See the rankings",
      title: "Leaderboard",
      description: "Check the live podium and see how your latest score moved your rank.",
      cta: "View Leaderboard",
      accent: {
        iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30",
        iconText: "text-amber-400",
        hoverBorder: "hover:border-amber-500/50",
        hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.6)]",
        cta: "bg-amber-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(245,158,11,0.7)] group-hover:bg-amber-400",
      },
    },
    {
      href: "/student/history",
      icon: History,
      eyebrow: "Look back",
      title: "Review History",
      description: "Browse every past submission — subject, score, and when you took it.",
      cta: "Open History",
      accent: {
        iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30",
        iconText: "text-violet-400",
        hoverBorder: "hover:border-violet-500/50",
        hoverShadow: "hover:shadow-[0_0_55px_-12px_rgba(139,92,246,0.6)]",
        cta: "bg-violet-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] group-hover:bg-violet-400",
      },
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Welcome back
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Your exam activity, streak, and standing across the institute.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {metrics.map((metric, index) => {
          const accent = accentClasses[metric.accent];
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
            >
              <CornerBrackets colorClass={`${accent.iconText}/50`} alwaysVisible />
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.iconBg}`}>
                <metric.icon className={`h-5 w-5 ${accent.iconText}`} />
              </span>
              <p className="mt-4 text-3xl font-bold text-white">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
              <p className="mt-1 text-xs text-slate-600">{metric.hint}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Link
              href={action.href}
              className={`card-glow relative block h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-md transition-all duration-300 ${action.accent.hoverBorder} ${action.accent.hoverShadow}`}
            >
              <CornerBrackets colorClass={action.accent.iconText} />
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${action.accent.iconBg}`}
              >
                <action.icon className={`h-7 w-7 ${action.accent.iconText}`} />
              </span>
              <p className={`mt-6 text-xs font-semibold uppercase tracking-widest ${action.accent.iconText}`}>
                {action.eyebrow}
              </p>
              <h3 className="mt-1.5 text-xl font-bold text-white">{action.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{action.description}</p>
              <div
                className={`mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${action.accent.cta}`}
              >
                {action.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
