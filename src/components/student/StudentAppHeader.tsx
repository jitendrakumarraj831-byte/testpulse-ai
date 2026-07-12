"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  FileText,
  GraduationCap,
  History,
  IndianRupee,
  LayoutDashboard,
  Library,
  Trophy,
  type LucideIcon,
} from "lucide-react";

interface StudentNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const STUDENT_NAV: StudentNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { key: "exams", label: "Exam Arena", href: "/exams", icon: GraduationCap },
  { key: "schedule", label: "Schedule", href: "/student/schedule", icon: CalendarClock },
  { key: "assignments", label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { key: "attendance", label: "Attendance", href: "/student/attendance", icon: CheckSquare },
  { key: "fees", label: "Fees", href: "/student/fees", icon: IndianRupee },
  { key: "documents", label: "Documents", href: "/student/documents", icon: FileText },
  { key: "ai-guru", label: "AI Guru", href: "/ai-guru", icon: Bot },
  { key: "library", label: "Library", href: "/library", icon: Library },
  { key: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { key: "history", label: "History", href: "/student/history", icon: History },
];

/** The nav shell for every /student/* route — deliberately its own
 * component (not the marketing Navbar, not the AdminShell sidebar) so this
 * signed-in student surface never shares chrome with either. */
export function StudentAppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/portal" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
              <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              TestPulse <span className="text-cyan-400">AI</span>
            </span>
          </Link>
          <span className="ml-1 rounded-full border border-slate-700 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
            Student Panel
          </span>
        </div>

        <Link
          href="/portal"
          className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
        >
          Home
        </Link>
      </div>

      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 lg:px-6">
        {STUDENT_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
