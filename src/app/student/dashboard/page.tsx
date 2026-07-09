import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getStudentDashboardData } from "@/lib/student/dashboard-data";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";

export const metadata: Metadata = {
  title: "Student Dashboard | TestPulse AI",
  description: "Your submissions, streak, and institute rank in one premium panel.",
};

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  noStore();

  // No session is possible without Supabase configured — this route is only
  // reachable at all with a real session (middleware gates it), so this
  // just prevents a crash in local/preview environments without env vars.
  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/dashboard");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/dashboard");
  }

  const data = await getStudentDashboardData(supabase, user);

  return <StudentDashboardView {...data} />;
}
