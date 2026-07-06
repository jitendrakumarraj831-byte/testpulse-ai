import type { Metadata } from "next";
import { formatTestTitle } from "@/lib/exam/mock-exam";
import { ExamClient } from "@/components/exam/ExamClient";

interface TestPageProps {
  params: Promise<{ testId: string }>;
}

export async function generateMetadata({
  params,
}: TestPageProps): Promise<Metadata> {
  const { testId } = await params;
  const title = formatTestTitle(testId);
  return {
    title: `${title} | TestPulse AI`,
    description: `Take the ${title} on TestPulse AI — a live, timed mock exam with instant navigation and review tools.`,
  };
}

export default async function TestPage({ params }: TestPageProps) {
  const { testId } = await params;
  return <ExamClient testId={testId} />;
}
