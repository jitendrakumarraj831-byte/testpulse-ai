import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ExamZoneContent } from "@/components/student/ExamZoneContent";
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

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <ExamZoneContent subjectSlug={slug} />
      <Footer />
    </div>
  );
}
