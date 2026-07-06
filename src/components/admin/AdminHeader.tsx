import Link from "next/link";
import { Activity, ChevronRight, LayoutDashboard } from "lucide-react";

export function AdminHeader() {
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

      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 pb-4 text-sm text-slate-500 lg:px-8">
        <LayoutDashboard className="h-4 w-4" />
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>AI Tools</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-cyan-400">AI Question Generator</span>
      </div>
    </header>
  );
}
