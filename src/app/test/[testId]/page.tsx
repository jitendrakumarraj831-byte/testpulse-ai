import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TestWorkspace } from "@/components/student/TestWorkspace";
import { resolveTest } from "@/lib/student/resolve-test";

interface TestPageProps {
  params: Promise<{ testId: string }>;
}

export async function generateMetadata({
  params,
}: TestPageProps): Promise<Metadata> {
  const { testId } = await params;
  const resolved = await resolveTest(testId);

  return {
    title: resolved
      ? `${resolved.examTitle} | TestPulse AI`
      : "Exam Workspace | TestPulse AI",
  };
}

export default async function TestPage({ params }: TestPageProps) {
  const { testId } = await params;
  const resolved = await resolveTest(testId);

  if (!resolved) {
    notFound();
  }

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <TestWorkspace
        examId={resolved.examId}
        examTitle={resolved.examTitle}
        subjectName={resolved.subject.name}
        subjectSlug={resolved.subject.slug}
        difficulty={resolved.difficulty}
        durationMinutes={resolved.durationMinutes}
        questions={resolved.questions}
        accent={resolved.subject.accent}
      />
      <Footer />
    </div>
  );
}
