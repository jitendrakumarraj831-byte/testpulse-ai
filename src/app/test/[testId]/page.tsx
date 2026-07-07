import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TestWorkspace } from "@/components/student/TestWorkspace";
import { getExamById } from "@/lib/student/exams";
import { getSubjectBySlug } from "@/lib/student/subjects";
import { getQuestionsForSubject } from "@/lib/student/question-bank";

interface TestPageProps {
  params: Promise<{ testId: string }>;
}

export async function generateMetadata({
  params,
}: TestPageProps): Promise<Metadata> {
  const { testId } = await params;
  const lookup = getExamById(testId);

  return {
    title: lookup
      ? `${lookup.exam.title} | TestPulse AI`
      : "Exam Workspace | TestPulse AI",
  };
}

export default async function TestPage({ params }: TestPageProps) {
  const { testId } = await params;
  const lookup = getExamById(testId);

  if (!lookup) {
    notFound();
  }

  const { exam, subjectSlug } = lookup;
  const subject = getSubjectBySlug(subjectSlug);

  if (!subject || exam.status === "locked") {
    notFound();
  }

  const questions = getQuestionsForSubject(subjectSlug).slice(
    0,
    exam.questionCount,
  );

  if (questions.length === 0) {
    notFound();
  }

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <TestWorkspace
        examTitle={exam.title}
        subjectName={subject.name}
        subjectSlug={subjectSlug}
        difficulty={exam.difficulty}
        durationMinutes={exam.durationMinutes}
        questions={questions}
        accent={subject.accent}
      />
      <Footer />
    </div>
  );
}
