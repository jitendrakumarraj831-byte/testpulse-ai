"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const PORTAL_COPY: Record<string, { heading: string; subheading: string }> = {
  admin: { heading: "Institute Admin Sign In", subheading: "Manage your institute — log in to continue." },
  student: { heading: "Student Sign In", subheading: "Back to your studies — log in to continue." },
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // `portal` only customizes this heading's copy — which account you land
  // on is still determined entirely by profiles.role after auth, exactly
  // as before. There's no "log in as admin" mechanism; that would be
  // insecure and nonsensical (an account's role isn't a login choice).
  const portalCopy = PORTAL_COPY[searchParams.get("portal") ?? ""] ?? {
    heading: "Welcome back",
    subheading: "Log in to continue.",
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsSubmitting(false);
        setErrorMessage(error.message);
        return;
      }

      // An explicit redirect (e.g. bounced here from a gated /admin or
      // /student route) always wins; otherwise route by role so an admin
      // lands in the admin suite and a student lands on their dashboard.
      const explicitRedirect = searchParams.get("redirect");
      let redirectTo = explicitRedirect || "/student/dashboard";

      if (!explicitRedirect && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        redirectTo = profile?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Failed to log in:", error);
      setIsSubmitting(false);
      setErrorMessage(
        "We couldn't reach our servers just now. Please try again shortly.",
      );
    }
  };

  return (
    <>
      <h1 className="text-lg font-bold text-white sm:text-xl">{portalCopy.heading}</h1>
      <p className="mt-1 text-sm text-slate-500">{portalCopy.subheading}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-slate-400">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(6,182,212,0.8)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_-4px_rgba(6,182,212,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Log in
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300">
          Register
        </Link>
      </p>
    </>
  );
}
