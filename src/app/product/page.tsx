import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhiteLabelPreview } from "@/components/landing/WhiteLabelPreview";
import { EnterpriseFeatures } from "@/components/landing/EnterpriseFeatures";
import { InstitutionPricing } from "@/components/landing/InstitutionPricing";
import { StudentHero } from "@/components/student/StudentHero";
import { SubjectGrid } from "@/components/student/SubjectGrid";
import { CommandDeck } from "@/components/dashboard/CommandDeck";

export const metadata: Metadata = {
  title: "TestPulse AI | AI-Powered Exam Engine for Coaching Institutes",
  description:
    "TestPulse AI helps coaching institutes and educators generate AI-crafted exams, run a white-labeled student portal, and track performance analytics in real time.",
};

/** The marketing/product-pitch content that used to live at "/" before the
 * root route became a strict two-entry-point login gateway for logged-out
 * visitors. Relocated, not deleted — this is still how a prospective
 * institute discovers pricing/features, linked from GuestGateway. */
export default function ProductPage() {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <StudentHero />
        <CommandDeck />
        <SubjectGrid />
        <WhiteLabelPreview />
        <EnterpriseFeatures />
        <InstitutionPricing />
      </main>
      <Footer />
    </div>
  );
}
