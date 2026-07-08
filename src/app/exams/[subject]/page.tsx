import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ExamZoneContent } from "@/components/student/ExamZoneContent";
import { getSubjectBySlug } from "@/lib/student/subjects";
import { getLiveExamsForSubject } from "@/lib/student/live-exams";

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

  // Live-published exams are fetched server-side, strictly filtered to
  // this subject slug (DB-level .or(ilike...) + an application-level
  // re-check inside getLiveExamsForSubject — see live-exams.ts), and
  // merged with the mock catalog. Any failure (Supabase unconfigured,
  // network error, no rows) resolves to [] so the page still renders the
  // mock catalog untouched.
  const liveExams = await getLiveExamsForSubject(slug);

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <ExamZoneContent subjectSlug={slug} liveExams={liveExams} />
      <Footer />
    </div>
  );
}
