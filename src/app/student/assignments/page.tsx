import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getAssignmentsWithSubmissions } from "@/lib/academic-hub/data";
import { StudentAssignmentsView } from "@/components/student/StudentAssignmentsView";

export const metadata: Metadata = {
  title: "Assignments | TestPulse AI",
  description: "Submit your homework and check grades as they come in.",
};

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/assignments");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/assignments");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("batch")
    .eq("id", user.id)
    .maybeSingle();

  const { assignments, submissionsByAssignmentId } = await getAssignmentsWithSubmissions(
    supabase,
    user.id,
    profile?.batch ?? null,
  );

  return (
    <StudentAssignmentsView
      studentId={user.id}
      assignments={assignments}
      submissionsByAssignmentId={submissionsByAssignmentId}
    />
  );
}
