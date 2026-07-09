import { Fragment } from "react";
import Link from "next/link";
import {
  Activity,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  UserCog,
  Wrench,
} from "lucide-react";

interface AdminHeaderProps {
  activeLabel?: string;
  activePage?: "dashboard" | "ai-tools" | "generator" | "uploader" | "students";
}

const ADMIN_TABS = [
  {
    key: "dashboard" as const,
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "ai-tools" as const,
    label: "AI Tools",
    href: "/admin/ai-tools",
    icon: Wrench,
  },
  {
    key: "generator" as const,
    label: "AI Generator",
    href: "/admin/ai-generator",
    icon: Sparkles,
  },
  {
    key: "uploader" as const,
    label: "Bulk Uploader",
    href: "/admin/upload-questions",
    icon: UploadCloud,
  },
  {
    key: "students" as const,
    label: "Manage Students",
    href: "/admin/students",
    icon: UserCog,
  },
];

export function AdminHeader({
  activeLabel = "AI Question Generator",
  activePage,
}: AdminHeaderProps) {
  // Dashboard is the root of the admin section. AI Tools and Manage
  // Students are both sections directly under it (siblings, not nested in
  // each other); the generator/uploader pages are leaves under AI Tools.
  // The breadcrumb reflects that real hierarchy instead of always chaining
  // through a fixed 3-level path (which repeated "Dashboard" on the
  // Dashboard page itself, and would wrongly nest Students under AI Tools).
  const breadcrumbSegments: { label: string; href?: string }[] =
    activePage === "dashboard"
      ? [{ label: "Dashboard" }]
      : activePage === "ai-tools"
        ? [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "AI Tools" }]
        : activePage === "students"
          ? [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Manage Students" }]
          : [
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "AI Tools", href: "/admin/ai-tools" },
              { label: activeLabel },
            ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
              <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              TestPulse <span className="text-cyan-400">AI</span>
            </span>
          </Link>
          <span className="ml-1 rounded-full border border-slate-700 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 py-1.5 pl-2 pr-3 sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950">
              PA
            </span>
            <span className="text-xs font-medium text-slate-300">
              Prime Academy
            </span>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Exit to Site
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 lg:px-6">
        {ADMIN_TABS.map((tab) => {
          const isActive = tab.key === activePage;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-2 border-t border-slate-800/60 px-6 py-3 text-sm text-slate-500 lg:px-8">
        <LayoutDashboard className="h-4 w-4" />
        {breadcrumbSegments.map((segment, index) => (
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
    </header>
  );
}
