import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeaturesGrid />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
