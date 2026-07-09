import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AIGeneratorPanel } from "@/components/admin/AIGeneratorPanel";
import { LiveAnalyticsPreview } from "@/components/admin/LiveAnalyticsPreview";
import { ExamInsightsPanel } from "@/components/admin/ExamInsightsPanel";

export const metadata: Metadata = {
  title: "AI Question Generator | TestPulse AI Admin",
  description:
    "Generate exam-ready question papers with AI, review each question, and publish the batch for students.",
};

export default function AiGeneratorPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader activePage="generator" />
      <div className="mx-auto max-w-4xl space-y-6 px-6 pt-10 lg:px-8">
        <LiveAnalyticsPreview />
        <ExamInsightsPanel />
      </div>
      <Suspense>
        <AIGeneratorPanel />
      </Suspense>
    </div>
  );
}
