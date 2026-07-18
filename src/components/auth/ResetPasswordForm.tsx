"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type LinkStatus = "checking" | "ready" | "invalid";
type SubmitStatus = "idle" | "submitting" | "done" | "error";

export function ResetPasswordForm() {
  const router = useRouter();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // The reset-password link lands here with a Supabase recovery code in
    // the URL; the browser client (detectSessionInUrl, on by default)
    // exchanges it for a session automatically on init and fires
    // "PASSWORD_RECOVERY" once that's done. We also check for an
    // already-established session directly in case that event fired before
    // this listener was attached.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLinkStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLinkStatus("ready");
      }
    });

    // Give the async code exchange a moment before concluding the link is
    // invalid/expired rather than just missing its session yet.
    const timeout = setTimeout(() => {
      setLinkStatus((current) => (current === "checking" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setSubmitStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    setSubmitStatus("submitting");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setSubmitStatus("error");
        setErrorMessage(error.message);
        return;
      }

      setSubmitStatus("done");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Failed to update password:", error);
      setSubmitStatus("error");
      setErrorMessage(
        "We couldn't reach our servers just now. Please try again shortly.",
      );
    }
  };

  if (linkStatus === "checking") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <p className="text-sm text-slate-400">Verifying your reset link…</p>
      </div>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/30">
          <AlertCircle className="h-6 w-6 text-rose-400" />
        </span>
        <h1 className="text-lg font-bold text-white">Link expired or invalid</h1>
        <p className="max-w-xs text-sm text-slate-400">
          This password reset link is no longer valid. Request a new one to continue.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (submitStatus === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </span>
        <h1 className="text-lg font-bold text-white">Password updated</h1>
        <p className="max-w-xs text-sm text-slate-400">Taking you to login…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-lg font-bold text-white sm:text-xl">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="text-xs font-medium text-slate-400">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            disabled={submitStatus === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="text-xs font-medium text-slate-400">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            disabled={submitStatus === "submitting"}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        {submitStatus === "error" && errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitStatus === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitStatus === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Update password
            </>
          )}
        </button>
      </form>
    </>
  );
}
