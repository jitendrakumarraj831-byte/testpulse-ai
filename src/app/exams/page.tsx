import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SubjectGrid } from "@/components/student/SubjectGrid";

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
        <SubjectGrid />
      </main>
      <Footer />
    </div>
  );
}
