import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSubjectBySlug } from "@/lib/student/subjects";

interface ExamZonePageProps {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({
  params,
}: ExamZonePageProps): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubjectBySlug(slug);

  return {
    title: subject
      ? `${subject.name} Exams | TestPulse AI`
      : "Exam Zone | TestPulse AI",
  };
}

export default async function ExamZonePage({ params }: ExamZonePageProps) {
  const { subject: slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const Icon = subject.icon;

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${subject.accent.iconBg}`}
          >
            <Icon className={`h-7 w-7 ${subject.accent.iconText}`} />
          </span>

          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            {subject.name} Exam Zone
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Live exams for this subject will appear here as institutes
            publish them. This is a simulated preview of the student exam
            list while the full catalog goes live.
          </p>

          <div className="card-glow mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              No published {subject.name.toLowerCase()} exams yet
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon, or ask your institute to publish one from the
              AI Question Generator.
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
