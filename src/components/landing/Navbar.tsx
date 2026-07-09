"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Bot, Library, Menu, Trophy, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "For Institutes", href: "/#institutes" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
        isScrolled
          ? "border-border/80 bg-background/80 backdrop-blur-lg"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
            <Activity className="h-5 w-5 text-cyan-400" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            TestPulse <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-cyan-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/ai-guru"
            className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-sm font-medium text-violet-300 transition-colors hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-violet-200"
          >
            <Bot className="h-3.5 w-3.5" />
            AI Guru
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-200"
          >
            <Library className="h-3.5 w-3.5" />
            Library
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-sm font-medium text-amber-300 transition-colors hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-amber-200"
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/#pricing"
            className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_28px_-2px_rgba(6,182,212,0.85)]"
          >
            Create Institute Account
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-border bg-slate-950/95 backdrop-blur-lg lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-cyan-400"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/ai-guru"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-violet-300 hover:bg-white/5"
            >
              <Bot className="h-4 w-4" />
              AI Guru
            </Link>
            <Link
              href="/library"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-cyan-300 hover:bg-white/5"
            >
              <Library className="h-4 w-4" />
              Library
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-amber-300 hover:bg-white/5"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 rounded-full bg-cyan-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Create Institute Account
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}
