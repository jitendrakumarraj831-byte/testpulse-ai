import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AIGeneratorPanel } from "@/components/admin/AIGeneratorPanel";

export const metadata: Metadata = {
  title: "AI Question Generator | TestPulse AI Admin",
  description:
    "Generate exam-ready question papers with AI, review each question, and publish the batch for students.",
};

export default function AiGeneratorPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader />
      <AIGeneratorPanel />
    </div>
  );
}
