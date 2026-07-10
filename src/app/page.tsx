import type { Metadata } from "next";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { PublicReadingHome } from "@/components/landing/PublicReadingHome";
import type { LibraryResource } from "@/lib/library/types";

export const metadata: Metadata = {
  title: "TestPulse AI | Read, Practice, and Learn",
  description:
    "Browse chapter notes and books, practice Current Affairs, and chat with AI Guru — free to explore, no sign-in required. Institutes and their students go to the Institute Workspace to manage everything else.",
};

export const dynamic = "force-dynamic";

/** The public "/" — a guest-facing reading and practice platform, open to
 * anyone with no sign-in required. This is deliberately separate from the
 * signed-in-aware gateway/dashboards, which now live at /portal (see
 * src/app/portal/page.tsx). Only real, database-backed content is shown
 * here: a handful of actual `library_catalog()` resources as a preview —
 * there is no articles/blog content model in this app, so this page
 * doesn't invent one. */
export default async function Home() {
  noStore();

  let featuredResources: LibraryResource[] = [];

  if (isSupabaseConfigured) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.rpc("library_catalog");

    if (error) {
      console.error("[home] Failed to load featured resources:", error);
    } else {
      featuredResources = ((data ?? []) as LibraryResource[]).slice(0, 3);
    }
  }

  return (
    <PublicReadingHome
      featuredResources={featuredResources}
      isConfigured={isSupabaseConfigured}
    />
  );
}
