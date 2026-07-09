import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AiGuruWorkspace } from "@/components/ai-guru/AiGuruWorkspace";

export const metadata: Metadata = {
  title: "AI Guru | TestPulse AI",
  description:
    "A 24/7 AI doubt-solver — ask academic questions and get step-by-step explanations instantly.",
};

export default function AiGuruPage() {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <AiGuruWorkspace />
      </main>
      <Footer />
    </div>
  );
}
