import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SubjectGrid } from "@/components/student/SubjectGrid";
import { StreakCard } from "@/components/student/StreakCard";

export const metadata: Metadata = {
  title: "Student Exam Panel | TestPulse AI",
  description:
    "Pick a subject and enter an AI-calibrated exam zone built for students who move fast.",
};

export default function ExamsIndexPage() {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <StreakCard />
        </div>
        <SubjectGrid />
      </main>
      <Footer />
    </div>
  );
}
