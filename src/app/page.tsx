import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhiteLabelPreview } from "@/components/landing/WhiteLabelPreview";
import { EnterpriseFeatures } from "@/components/landing/EnterpriseFeatures";
import { InstitutionPricing } from "@/components/landing/InstitutionPricing";
import { StudentHero } from "@/components/student/StudentHero";
import { SubjectGrid } from "@/components/student/SubjectGrid";
import { CommandDeck } from "@/components/dashboard/CommandDeck";

export default function Home() {
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
