"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileCheck2,
  Gauge,
  Sparkles,
  Terminal,
  UploadCloud,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resolveExamInfo } from "@/lib/student/exam-info";
import { formatRelativeTime } from "@/lib/student/leaderboard";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface FeedItem {
  id: string;
  studentName: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  accuracyPercent: number | null;
  submittedAt: string;
}

interface DashboardData {
  examsCount: number;
  submissionsCount: number;
  averageAccuracyPercent: number | null;
  feed: FeedItem[];
}

type LoadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "ready"; data: DashboardData };

function accuracyTone(percent: number | null): string {
  if (percent === null) return "text-slate-400";
  if (percent >= 70) return "text-emerald-400";
  if (percent >= 40) return "text-amber-400";
  return "text-rose-400";
}

export function DashboardControlCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    const run = async () => {
      const [examsCountRes, submissionsCountRes, recentRes] = await Promise.all([
        client.from("exams").select("id", { count: "exact", head: true }),
        client
          .from("leaderboard_entries")
          .select("id", { count: "exact", head: true }),
        client
          .from("leaderboard_entries")
          .select("id, exam_id, student_name, score, submitted_at")
          .order("submitted_at", { ascending: false })
          .limit(50),
      ]);

      const rows = recentRes.data ?? [];
      const examIds = [...new Set(rows.map((row) => row.exam_id))];
      const examInfo = await resolveExamInfo(examIds);

      const feed: FeedItem[] = rows.map((row) => {
        const info = examInfo[row.exam_id];
        const totalQuestions = info?.totalQuestions ?? 0;
        const score = Number(row.score ?? 0);
        return {
          id: row.id,
          studentName: row.student_name,
          subjectName: info?.subjectName ?? "Unknown subject",
          score,
          totalQuestions,
          accuracyPercent:
            totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : null,
          submittedAt: row.submitted_at,
        };
      });

      const accuracies = feed
        .map((item) => item.accuracyPercent)
        .filter((value): value is number => value !== null);
      const averageAccuracyPercent =
        accuracies.length > 0
          ? Math.round(accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length)
          : null;

      setState({
        status: "ready",
        data: {
          examsCount: examsCountRes.count ?? 0,
          submissionsCount: submissionsCountRes.count ?? 0,
          averageAccuracyPercent,
          feed,
        },
      });
    };

    void run();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Control center
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Live platform stats, recent student activity, and one-click access
          to every AI tool.
        </p>
      </motion.div>

      <QuickStats state={state} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed state={state} />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}

function QuickStats({ state }: { state: LoadState }) {
  const cards: {
    key: string;
    icon: LucideIcon;
    label: string;
    value: string;
    accent: string;
  }[] = [
    {
      key: "exams",
      icon: FileCheck2,
      label: "Total exams published",
      value:
        state.status === "ready"
          ? state.data.examsCount.toLocaleString()
          : state.status === "unconfigured"
            ? "—"
            : "···",
      accent: "cyan",
    },
    {
      key: "submissions",
      icon: Users,
      label: "Total student submissions",
      value:
        state.status === "ready"
          ? state.data.submissionsCount.toLocaleString()
          : state.status === "unconfigured"
            ? "—"
            : "···",
      accent: "violet",
    },
    {
      key: "accuracy",
      icon: Gauge,
      label: "Platform average accuracy",
      value:
        state.status === "ready"
          ? state.data.averageAccuracyPercent !== null
            ? `${state.data.averageAccuracyPercent}%`
            : "No data yet"
          : state.status === "unconfigured"
            ? "—"
            : "···",
      accent: "emerald",
    },
  ];

  const accentClasses: Record<string, { iconBg: string; iconText: string }> = {
    cyan: { iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30", iconText: "text-cyan-400" },
    violet: {
      iconBg: "bg-violet-500/10 ring-1 ring-violet-500/30",
      iconText: "text-violet-400",
    },
    emerald: {
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
      iconText: "text-emerald-400",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {cards.map((card, index) => {
        const accent = accentClasses[card.accent];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
          >
            <CornerBrackets colorClass={`${accent.iconText}/50`} alwaysVisible />
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.iconBg}`}
            >
              <card.icon className={`h-5 w-5 ${accent.iconText}`} />
            </span>
            <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </motion.div>
        );
      })}
      {state.status === "unconfigured" && (
        <p className="sm:col-span-3 text-xs text-slate-600">
          Supabase isn&apos;t configured in this environment, so live stats
          can&apos;t load — this is expected in local/preview setups without
          env vars set.
        </p>
      )}
    </div>
  );
}

function ActivityFeed({ state }: { state: LoadState }) {
  return (
    <div className="card-glow relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
      <div className="flex items-center gap-2.5 border-b border-slate-800 px-5 py-4">
        <Terminal className="h-4 w-4 text-cyan-400" />
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
          Live activity feed
        </p>
        <span className="relative ml-auto flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto p-5 font-mono text-xs leading-relaxed">
        {state.status !== "ready" && (
          <p className="text-slate-600">
            {state.status === "unconfigured"
              ? "// awaiting Supabase connection…"
              : "// loading recent submissions…"}
          </p>
        )}

        {state.status === "ready" && state.data.feed.length === 0 && (
          <p className="text-slate-600">{"// no student activity yet"}</p>
        )}

        {state.status === "ready" &&
          state.data.feed.map((item) => (
            <div key={item.id} className="py-1">
              <span className="text-slate-600">
                [{formatRelativeTime(item.submittedAt)}]
              </span>{" "}
              <span className="text-cyan-400">&gt;</span>{" "}
              <span className="text-white">{item.studentName}</span>{" "}
              <span className="text-slate-500">scored</span>{" "}
              <span className={accuracyTone(item.accuracyPercent)}>
                {item.score}/{item.totalQuestions || "—"}
                {item.accuracyPercent !== null ? ` (${item.accuracyPercent}%)` : ""}
              </span>{" "}
              <span className="text-slate-500">in</span>{" "}
              <span className="text-slate-300">{item.subjectName}</span>
            </div>
          ))}

        {state.status === "ready" && state.data.feed.length > 0 && (
          <p className="mt-1 text-slate-600">
            <span className="text-cyan-400">&gt;</span>{" "}
            <span className="animate-pulse">▍</span>
          </p>
        )}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      href: "/admin/ai-generator",
      icon: Sparkles,
      label: "AI Generator",
      description: "Generate a new exam",
      accent: "text-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/30",
    },
    {
      href: "/admin/upload-questions#ai-text-parser",
      icon: UploadCloud,
      label: "Bulk Uploader",
      description: "Import or parse questions",
      accent: "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30",
    },
    {
      href: "/admin/ai-tools",
      icon: Wrench,
      label: "AI Tools Hub",
      description: "Browse every tool",
      accent: "text-violet-400 bg-violet-500/10 ring-1 ring-violet-500/30",
    },
    {
      href: "/admin/students",
      icon: UserCog,
      label: "Manage Students",
      description: "View the student directory",
      accent: "text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30",
    },
  ];

  return (
    <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      <p className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Quick actions
      </p>
      <div className="mt-3 space-y-2.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 transition-all hover:border-cyan-500/40 hover:bg-slate-900/60"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.accent}`}>
              <action.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="truncate text-xs text-slate-500">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
