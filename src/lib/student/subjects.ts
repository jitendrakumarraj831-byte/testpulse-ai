import type { LucideIcon } from "lucide-react";
import { Atom, Brain, Rss, Sigma } from "lucide-react";

export interface SubjectAccent {
  iconBg: string;
  iconText: string;
  hoverBorder: string;
  hoverShadow: string;
  chip: string;
  /** Solid border/shadow classes for a persistently "active" state (e.g. the current item in a nav deck). */
  activeRing: string;
}

export interface Subject {
  slug: string;
  name: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  accent: SubjectAccent;
}

export const SUBJECTS: Subject[] = [
  {
    slug: "general-knowledge",
    name: "General Knowledge",
    shortLabel: "GK",
    description: "Static GK, world affairs, and reasoning fundamentals.",
    icon: Brain,
    accent: {
      iconBg: "bg-purple-500/10 ring-1 ring-purple-500/30",
      iconText: "text-purple-400",
      hoverBorder: "group-hover:border-purple-500/50",
      hoverShadow:
        "group-hover:shadow-[0_0_45px_-10px_rgba(168,85,247,0.6)]",
      chip: "bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30",
      activeRing:
        "border-purple-500 shadow-[0_0_16px_-2px_rgba(168,85,247,0.8)]",
    },
  },
  {
    slug: "mathematics",
    name: "Mathematics",
    shortLabel: "Math",
    description: "Algebra, calculus, and formula-driven problem solving.",
    icon: Sigma,
    accent: {
      iconBg: "bg-amber-500/10 ring-1 ring-amber-500/30",
      iconText: "text-amber-400",
      hoverBorder: "group-hover:border-amber-500/50",
      hoverShadow:
        "group-hover:shadow-[0_0_45px_-10px_rgba(245,158,11,0.6)]",
      chip: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
      activeRing:
        "border-amber-500 shadow-[0_0_16px_-2px_rgba(245,158,11,0.8)]",
    },
  },
  {
    slug: "science",
    name: "Science",
    shortLabel: "Physics / Chemistry",
    description: "Core physics and chemistry concepts, calibrated by grade.",
    icon: Atom,
    accent: {
      iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
      iconText: "text-cyan-400",
      hoverBorder: "group-hover:border-cyan-500/50",
      hoverShadow: "group-hover:shadow-[0_0_45px_-10px_rgba(6,182,212,0.6)]",
      chip: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30",
      activeRing:
        "border-cyan-500 shadow-[0_0_16px_-2px_rgba(6,182,212,0.8)]",
    },
  },
  {
    slug: "current-affairs",
    name: "Current Affairs",
    shortLabel: "Current Affairs",
    description: "Live-updating news, policy, and events coverage.",
    icon: Rss,
    accent: {
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
      iconText: "text-emerald-400",
      hoverBorder: "group-hover:border-emerald-500/50",
      hoverShadow:
        "group-hover:shadow-[0_0_45px_-10px_rgba(16,185,129,0.6)]",
      chip: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
      activeRing:
        "border-emerald-500 shadow-[0_0_16px_-2px_rgba(16,185,129,0.8)]",
    },
  },
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.slug === slug);
}

/** Neutral cyan styling for exams whose subject label doesn't match one of the four browsable SUBJECTS (e.g. an AI-generated exam published under "Physics" or "Chemistry"). */
export const DEFAULT_ACCENT: SubjectAccent = {
  iconBg: "bg-cyan-500/10 ring-1 ring-cyan-500/30",
  iconText: "text-cyan-400",
  hoverBorder: "group-hover:border-cyan-500/50",
  hoverShadow: "group-hover:shadow-[0_0_45px_-10px_rgba(6,182,212,0.6)]",
  chip: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30",
  activeRing: "border-cyan-500 shadow-[0_0_16px_-2px_rgba(6,182,212,0.8)]",
};

export interface SubjectMeta {
  slug: string;
  name: string;
  accent: SubjectAccent;
}

/**
 * Free-text subject labels (as stored on a published `exams.subject`
 * column, or picked from the admin AI generator's dropdown) that belong
 * under each browsable SUBJECTS slug. The generator offers "Physics" and
 * "Chemistry" as distinct picks, but this app only browses a combined
 * "Science" subject page, so both roll up into it there.
 */
const SUBJECT_LABEL_ALIASES: Record<string, string[]> = {
  "general-knowledge": ["general knowledge", "gk"],
  mathematics: ["mathematics", "math", "maths"],
  science: ["science", "physics", "chemistry"],
  "current-affairs": ["current affairs", "ca"],
};

function findSlugForLabel(subjectName: string): string | undefined {
  const normalized = subjectName.trim().toLowerCase();
  return Object.entries(SUBJECT_LABEL_ALIASES).find(([, aliases]) =>
    aliases.includes(normalized),
  )?.[0];
}

/** Does this free-text subject label belong under the given browsable SUBJECTS slug? Used as a strict application-level guard after the DB-level filter in live-exams.ts, so a row can never render under the wrong subject page. Exact alias match only — never substring/fuzzy — so e.g. "Physics" can never accidentally match "general-knowledge". */
export function matchesSubjectSlug(subjectName: string, slug: string): boolean {
  return findSlugForLabel(subjectName) === slug;
}

/** All accepted free-text subject labels/abbreviations for a browsable slug (e.g. "gk", "general knowledge" for general-knowledge), used to build a case-insensitive Supabase `.or(ilike...)` filter. Empty array for an unrecognized slug. */
export function getSubjectLabelAliases(slug: string): string[] {
  return SUBJECT_LABEL_ALIASES[slug] ?? [];
}

/** Resolves a free-text subject label against the known SUBJECTS catalog (via the alias map above), falling back to a neutral slug/accent for labels outside it entirely. The original label is always preserved as the display name — a "Chemistry" exam keeps showing "Chemistry", it just inherits Science's slug/accent for routing and styling. */
export function resolveSubjectMeta(subjectName: string): SubjectMeta {
  const slug = findSlugForLabel(subjectName);
  const subject = slug ? getSubjectBySlug(slug) : undefined;
  if (subject) {
    return { slug: subject.slug, name: subjectName, accent: subject.accent };
  }
  return { slug: "unknown", name: subjectName, accent: DEFAULT_ACCENT };
}
