"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Status = "idle" | "submitting" | "check-email" | "error";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [batch, setBatch] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            batch: batch.trim() || null,
          },
        },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        // Email confirmation is disabled on this Supabase project — signed in immediately.
        router.push("/exams");
        router.refresh();
        return;
      }

      // Email confirmation is required before a session exists.
      setStatus("check-email");
    } catch (error) {
      console.error("Failed to register:", error);
      setStatus("error");
      setErrorMessage(
        "We couldn't reach our servers just now. Please try again shortly.",
      );
    }
  };

  if (status === "check-email") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </span>
        <h1 className="text-lg font-bold text-white">Check your email</h1>
        <p className="max-w-xs text-sm text-slate-400">
          We sent a confirmation link to <strong className="text-slate-200">{email}</strong>.
          Confirm it, then log in.
        </p>
        <Link
          href="/auth/login"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-lg font-bold text-white sm:text-xl">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Register to save your scores, streak, and badges for real.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="full-name" className="text-xs font-medium text-slate-400">
            Full name
          </label>
          <input
            id="full-name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Priya Sharma"
            disabled={status === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="priya@example.com"
            disabled={status === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="batch" className="text-xs font-medium text-slate-400">
            Batch / class (optional)
          </label>
          <input
            id="batch"
            value={batch}
            onChange={(event) => setBatch(event.target.value)}
            placeholder="Batch 2026-A"
            disabled={status === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-medium text-slate-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            disabled={status === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          Log in
        </Link>
      </p>
    </>
  );
}
