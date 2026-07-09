"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarClock,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Sparkles,
  UploadCloud,
  UserCog,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const ADMIN_NAV: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "ai-tools", label: "AI Tools", href: "/admin/ai-tools", icon: Wrench },
  { key: "generator", label: "AI Question Generator", href: "/admin/ai-generator", icon: Sparkles },
  { key: "uploader", label: "Bulk Uploader", href: "/admin/upload-questions", icon: UploadCloud },
  { key: "schedule", label: "Schedule", href: "/admin/schedule", icon: CalendarClock },
  { key: "assignments", label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
  { key: "attendance", label: "Attendance", href: "/admin/attendance", icon: CheckSquare },
  { key: "students", label: "Manage Students", href: "/admin/students", icon: UserCog },
  { key: "settings", label: "System Settings", href: "/admin/settings", icon: Settings },
];

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

/** The real hierarchy: Dashboard is the section root; AI Tools, Manage
 * Students, and System Settings are siblings under it; the generator/
 * uploader pages are leaves under AI Tools. Matches each nav item to its
 * place in that tree instead of a fixed-depth path. */
function getBreadcrumb(pathname: string): BreadcrumbSegment[] {
  if (pathname.startsWith("/admin/ai-generator")) {
    return [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "AI Tools", href: "/admin/ai-tools" },
      { label: "AI Question Generator" },
    ];
  }
  if (pathname.startsWith("/admin/upload-questions")) {
    return [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "AI Tools", href: "/admin/ai-tools" },
      { label: "Bulk Uploader" },
    ];
  }
  if (pathname.startsWith("/admin/ai-tools")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "AI Tools" }];
  }
  if (pathname.startsWith("/admin/students")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Manage Students" }];
  }
  if (pathname.startsWith("/admin/schedule")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Schedule" }];
  }
  if (pathname.startsWith("/admin/assignments")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Assignments" }];
  }
  if (pathname.startsWith("/admin/attendance")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Attendance" }];
  }
  if (pathname.startsWith("/admin/settings")) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "System Settings" }];
  }
  return [{ label: "Dashboard" }];
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="glow-field min-h-screen bg-slate-950 lg:flex">
      <aside className="hidden shrink-0 border-r border-slate-800 bg-slate-950/80 lg:flex lg:w-64 lg:flex-col">
        <Link href="/" className="flex items-center gap-2.5 border-b border-slate-800 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
            <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            TestPulse <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 py-1.5 pl-2 pr-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950">
              PA
            </span>
            <span className="text-xs font-medium text-slate-300">Prime Academy</span>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Home
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg lg:hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
                <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">
                TestPulse <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
            >
              Home
            </Link>
          </div>
          <div className="flex gap-1 overflow-x-auto px-4">
            {ADMIN_NAV.map((item) => {
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

        <div className="flex items-center gap-2 border-b border-slate-800/60 px-6 py-3 text-sm text-slate-500 lg:px-8">
          <LayoutDashboard className="h-4 w-4" />
          {breadcrumb.map((segment, index) => (
            <Fragment key={segment.label}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {segment.href ? (
                <Link href={segment.href} className="transition-colors hover:text-cyan-400">
                  {segment.label}
                </Link>
              ) : (
                <span className="font-medium text-cyan-400">{segment.label}</span>
              )}
            </Fragment>
          ))}
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
