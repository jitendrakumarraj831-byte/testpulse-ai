"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Subject } from "@/lib/student/subjects";

interface SubjectCardProps {
  subject: Subject;
  index: number;
}

export function SubjectCard({ subject, index }: SubjectCardProps) {
  const Icon = subject.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link
        href={`/exams/${subject.slug}`}
        className={`block h-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all duration-300 ${subject.accent.hoverBorder} ${subject.accent.hoverShadow}`}
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${subject.accent.iconBg}`}
        >
          <Icon className={`h-6 w-6 ${subject.accent.iconText}`} />
        </span>

        <h3 className="mt-5 text-lg font-semibold text-white">
          {subject.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {subject.description}
        </p>

        <div
          className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${subject.accent.chip}`}
        >
          {subject.shortLabel}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors group-hover:text-white">
          Enter Exam Zone
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
