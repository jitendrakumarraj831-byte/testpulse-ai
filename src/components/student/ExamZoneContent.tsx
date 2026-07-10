"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getSubjectBySlug } from "@/lib/student/subjects";
import { MOCK_EXAMS, type MockExam } from "@/lib/student/exams";
import { ExamCard } from "@/components/student/ExamCard";

interface ExamZoneContentProps {
  subjectSlug: string;
  /** Real exams published via the admin AI generator for this subject —
   * fetched server-side in the page and merged in here so a freshly
   * published exam is actually discoverable by browsing, not just
   * reachable via a raw shared `/test/{id}` link. */
  publishedExams: MockExam[];
}

export function ExamZoneContent({ subjectSlug, publishedExams }: ExamZoneContentProps) {
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) return null;

  const Icon = subject.icon;
  const exams = [...(MOCK_EXAMS[subjectSlug] ?? []), ...publishedExams];
  const availableCount = exams.filter(
    (exam) => exam.status === "available",
  ).length;

  return (
    <main className="flex-1 px-6 pb-24 pt-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-cyan-500/50 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 text-center sm:text-left"
        >
          <span
            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${subject.accent.iconBg}`}
          >
            <Icon className={`h-7 w-7 ${subject.accent.iconText}`} />
          </span>

          <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {subject.name} Exams
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
            {subject.description}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {availableCount} of {exams.length} exams available now
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <ExamCard exam={exam} accent={subject.accent} />
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
