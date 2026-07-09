import Link from "next/link";
import {
  Activity,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  UploadCloud,
} from "lucide-react";

interface AdminHeaderProps {
  activeLabel?: string;
  activePage?: "generator" | "uploader";
}

const ADMIN_TABS = [
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
];

export function AdminHeader({
  activeLabel = "AI Question Generator",
  activePage,
}: AdminHeaderProps) {
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

      <div className="mx-auto flex max-w-6xl gap-1 px-4 lg:px-6">
        {ADMIN_TABS.map((tab) => {
          const isActive = tab.key === activePage;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
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
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>AI Tools</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-cyan-400">{activeLabel}</span>
      </div>
    </header>
  );
}
