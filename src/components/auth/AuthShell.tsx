import Link from "next/link";
import { Activity } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="glow-field flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
          <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">
          TestPulse <span className="text-cyan-400">AI</span>
        </span>
      </Link>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] via-slate-900/60 to-slate-950/80 p-8 shadow-[0_0_70px_-20px_rgba(6,182,212,0.4)] backdrop-blur-2xl">
        <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />
        {children}
      </div>
    </div>
  );
}
