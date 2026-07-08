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

/** Resolves a free-text subject label (as stored on a published `exams` row) against the known SUBJECTS catalog, falling back to a neutral slug/accent for labels outside it (e.g. "Physics" or "Chemistry" from the AI generator, which browses under the combined "Science" subject). */
export function resolveSubjectMeta(subjectName: string): SubjectMeta {
  const match = SUBJECTS.find(
    (subject) => subject.name.toLowerCase() === subjectName.toLowerCase(),
  );
  if (match) {
    return { slug: match.slug, name: match.name, accent: match.accent };
  }
  return { slug: "unknown", name: subjectName, accent: DEFAULT_ACCENT };
}
