import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AIToolsHub } from "@/components/admin/AIToolsHub";

export const metadata: Metadata = {
  title: "AI Tools | TestPulse AI Admin",
  description:
    "Generate a new exam with AI, or extract structured questions from text you already have.",
};

export default function AIToolsPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader activeLabel="AI Tools" activePage="ai-tools" />
      <AIToolsHub />
    </div>
  );
}
