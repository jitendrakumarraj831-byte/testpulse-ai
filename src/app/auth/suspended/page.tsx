import type { Metadata } from "next";
import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "Account Suspended | TestPulse AI",
};

export default function SuspendedPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/30">
          <ShieldOff className="h-6 w-6 text-rose-400" />
        </span>
        <h1 className="text-lg font-bold text-white">Account suspended</h1>
        <p className="max-w-xs text-sm text-slate-400">
          Your account has been suspended by an admin. Contact your institute
          if you think this is a mistake.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
          >
            Back to home
          </Link>
          <SignOutButton label="Sign out" />
        </div>
      </div>
    </AuthShell>
  );
}
