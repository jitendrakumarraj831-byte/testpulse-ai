import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Flame,
  GraduationCap,
  Video,
} from "lucide-react";
import type { Assignment, ScheduleEntry } from "@/lib/academic-hub/types";

interface StudentHomeOverviewProps {
  displayName: string;
  currentStreak: number;
  upcomingSchedule: ScheduleEntry[];
  outstandingAssignments: Assignment[];
  availableExamsCount: number;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  const dayLabel = isToday
    ? "Today"
    : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${dayLabel} · ${timeLabel}`;
}

function formatDue(iso: string): string {
  const due = new Date(iso);
  const isPast = due.getTime() < Date.now();
  const label = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return isPast ? `Overdue — was due ${label}` : `Due ${label}`;
}

export function StudentHomeOverview({
  displayName,
  currentStreak,
  upcomingSchedule,
  outstandingAssignments,
  availableExamsCount,
}: StudentHomeOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
      <div>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Schedule */}
        <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
                <CalendarClock className="h-4.5 w-4.5 text-cyan-400" />
              </span>
              <h2 className="text-sm font-semibold text-white">Your Schedule</h2>
            </div>
            <Link href="/student/schedule" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingSchedule.length === 0 && (
              <p className="text-sm text-slate-500">Nothing scheduled yet.</p>
            )}
            {upcomingSchedule.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-sm font-medium text-white">{entry.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatWhen(entry.startsAt)}</p>
                {entry.joinUrl && (
                  <a
                    href={entry.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <Video className="h-3 w-3" />
                    Join Class
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assignments */}
        <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                <ClipboardList className="h-4.5 w-4.5 text-violet-400" />
              </span>
              <h2 className="text-sm font-semibold text-white">Outstanding Homework</h2>
            </div>
            <Link href="/student/assignments" className="text-xs font-medium text-violet-400 hover:text-violet-300">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {outstandingAssignments.length === 0 && (
              <p className="text-sm text-slate-500">You&apos;re all caught up.</p>
            )}
            {outstandingAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-sm font-medium text-white">{assignment.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {assignment.subject} · {formatDue(assignment.dueAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak + Exam Arena */}
        <div className="space-y-6">
          <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30">
              <Flame className="h-4.5 w-4.5 text-amber-400" />
            </span>
            <p className="mt-4 text-3xl font-bold text-white">
              {currentStreak} day{currentStreak === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Consistency streak</p>
            <p className="mt-1 text-xs text-slate-600">
              {currentStreak > 0 ? "Keep it alive — come back tomorrow" : "Submit a test today to start one"}
            </p>
          </div>

          <Link
            href="/exams"
            className="card-glow group block rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <GraduationCap className="h-4.5 w-4.5 text-cyan-400" />
            </span>
            <p className="mt-4 text-3xl font-bold text-white">{availableExamsCount}</p>
            <p className="mt-1 text-sm text-slate-400">Exams available now</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
              Enter Exam Arena
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
