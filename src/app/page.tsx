import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { StudentHero } from "@/components/student/StudentHero";
import { SubjectGrid } from "@/components/student/SubjectGrid";

export default function Home() {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <StudentHero />
        <SubjectGrid />
      </main>
      <Footer />
    </div>
  );
}
