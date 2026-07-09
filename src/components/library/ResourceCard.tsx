"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FileText, Layers, Lock, type LucideIcon } from "lucide-react";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import type { LibraryResource } from "@/lib/library/types";

interface ResourceCardProps {
  resource: LibraryResource;
  index: number;
}

const CATEGORY_META: Record<LibraryResource["category"], { label: string; icon: LucideIcon }> = {
  book: { label: "Book", icon: BookOpen },
  notes: { label: "Chapter Notes", icon: FileText },
  catalog: { label: "Premium Catalog", icon: Layers },
};

export function ResourceCard({ resource, index }: ResourceCardProps) {
  const { label, icon: Icon } = CATEGORY_META[resource.category];
  const isPremium = resource.access_level === "premium";
  const isLocked = isPremium && !resource.file_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 * index }}
      className="group"
    >
      <div
        className={`card-glow relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 ${
          isLocked
            ? "opacity-80"
            : "hover:border-cyan-500/50 hover:shadow-[0_0_55px_-12px_rgba(6,182,212,0.6)]"
        }`}
      >
        <CornerBrackets colorClass={isPremium ? "text-amber-400" : "text-cyan-400"} />

        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isPremium
                ? "bg-amber-500/10 ring-1 ring-amber-500/30"
                : "bg-cyan-500/10 ring-1 ring-cyan-500/30"
            }`}
          >
            <Icon className={`h-5 w-5 ${isPremium ? "text-amber-400" : "text-cyan-400"}`} />
          </span>

          {isPremium ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
              Free
            </span>
          )}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold text-white">{resource.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
          {resource.description || "No description provided yet."}
        </p>

        <div className="mt-6">
          {resource.file_url ? (
            <Link
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400"
            >
              <BookOpen className="h-4 w-4" />
              Open Resource
            </Link>
          ) : (
            <Link
              href="/auth/login?redirect=/library"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:border-amber-400/50 hover:bg-amber-500/20"
            >
              <Lock className="h-4 w-4" />
              Sign In to Unlock
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
