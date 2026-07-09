import type { Metadata } from "next";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import type { LibraryResource } from "@/lib/library/types";

export const metadata: Metadata = {
  title: "Digital Library | TestPulse AI",
  description:
    "Browse books, chapter notes, and premium catalogs curated for your institute's Reading Room.",
};

export const dynamic = "force-dynamic";

/** Public route (like /exams and /leaderboard) — browsable logged out or
 * in, so it always uses the marketing Navbar/Footer chrome, never
 * StudentAppHeader/AdminShell. Access-gating for premium file_urls happens
 * server-side in the `library_catalog()` RPC (see schema.sql), not here —
 * this page just renders whatever that call returns for the caller's own
 * session. */
export default async function LibraryPage() {
  noStore();

  let resources: LibraryResource[] = [];

  // No session — and so no way to unlock premium resources — is possible
  // without Supabase configured. Render the page with an empty, honest
  // "unconfigured" state instead of crashing, same fallback used on "/"
  // and /student/dashboard.
  if (isSupabaseConfigured) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.rpc("library_catalog");

    if (error) {
      console.error("[library] Failed to load resources:", error);
    } else {
      resources = (data ?? []) as LibraryResource[];
    }
  }

  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-24">
        <LibraryGrid resources={resources} isConfigured={isSupabaseConfigured} />
      </main>
      <Footer />
    </div>
  );
}
