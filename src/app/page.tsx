import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getStudentDashboardData } from "@/lib/student/dashboard-data";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhiteLabelPreview } from "@/components/landing/WhiteLabelPreview";
import { EnterpriseFeatures } from "@/components/landing/EnterpriseFeatures";
import { InstitutionPricing } from "@/components/landing/InstitutionPricing";
import { StudentHero } from "@/components/student/StudentHero";
import { SubjectGrid } from "@/components/student/SubjectGrid";
import { CommandDeck } from "@/components/dashboard/CommandDeck";
import { StudentAppHeader } from "@/components/student/StudentAppHeader";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardControlCenter } from "@/components/admin/DashboardControlCenter";

export const dynamic = "force-dynamic";

/** Unified dynamic gateway: logged-out visitors get the marketing landing
 * page, a signed-in student lands directly on their dashboard, and a
 * signed-in admin lands directly on the control center — all on "/", so
 * there's no separate "logged in home" route to keep in sync with this one.
 * Each branch renders with only its own chrome (marketing Navbar/Footer,
 * StudentAppHeader, or AdminShell) so none of the three surfaces leak into
 * another, matching the isolation StudentAppHeader already documents for
 * every /student/* route. */
export default async function Home() {
  noStore();

  // No session is possible without Supabase configured — fall back to the
  // public landing page instead of crashing, matching how the middleware
  // (skips its auth gate entirely) and DashboardControlCenter (shows an
  // "unconfigured" empty state) already degrade in local/preview
  // environments that don't have the env vars set yet.
  if (!isSupabaseConfigured) {
    return <LandingPage />;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  // Belt-and-suspenders: middleware already blocks suspended accounts from
  // /admin/* and /student/*, but "/" isn't one of those prefixes, and this
  // route renders the same dashboards directly — so it needs its own check
  // rather than relying solely on middleware for this gate.
  if (profile?.status === "suspended") {
    redirect("/auth/suspended");
  }

  if (profile?.role === "admin") {
    return (
      <AdminShell>
        <DashboardControlCenter />
      </AdminShell>
    );
  }

  const dashboardData = await getStudentDashboardData(supabase, user);

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <StudentAppHeader />
      <main className="flex-1">
        <StudentDashboardView {...dashboardData} />
      </main>
    </div>
  );
}

function LandingPage() {
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
