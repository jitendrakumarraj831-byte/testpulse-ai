import Link from "next/link";
import { Activity, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

/** The entire logged-out "/" experience: exactly two entry points, no
 * marketing content mixed in. The pricing/feature marketing that used to
 * live here moved to /product, linked subtly below rather than deleted —
 * this is still a SaaS product prospective institutes need to discover
 * somewhere, just not on this gateway. */
export function GuestGateway() {
  return (
    <div className="glow-field flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
          <Activity className="h-5.5 w-5.5 text-cyan-400" strokeWidth={2.25} />
        </span>
        <span className="text-xl font-semibold tracking-tight text-white">
          TestPulse <span className="text-cyan-400">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-2xl text-center">
        <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Sign in to continue</h1>
        <p className="mt-2 text-sm text-slate-500">Choose your portal.</p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/auth/login?portal=student"
            className="card-glow group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="h-7 w-7 text-cyan-400" />
            </span>
            <p className="text-lg font-semibold text-white">Student Login</p>
            <p className="text-sm text-slate-500">Exams, schedule, homework, and your progress.</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/auth/login?portal=admin"
            className="card-glow group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_55px_-12px_rgba(139,92,246,0.6)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/30 transition-transform duration-300 group-hover:scale-110">
              <ShieldCheck className="h-7 w-7 text-violet-400" />
            </span>
            <p className="text-lg font-semibold text-white">Admin Login</p>
            <p className="text-sm text-slate-500">Fees, attendance, students, and exam deployment.</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate-600">
          New institute?{" "}
          <Link href="/product" className="font-medium text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-cyan-400">
            Learn what TestPulse AI can do
          </Link>
        </p>
      </div>
    </div>
  );
}
