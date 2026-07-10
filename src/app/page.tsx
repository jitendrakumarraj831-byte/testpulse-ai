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
    "Browse chapter notes and books, practice Current Affairs, and chat with AI Guru — free to explore, no sign-in required. TestPulse AI also runs the full institute back office: timetables, homework, attendance, fee ledgers, and an AI exam engine.",
};

export const dynamic = "force-dynamic";

/** The public "/" — a guest-facing reading and practice platform, open to
 * anyone with no sign-in required, that also carries the full product
 * story (enterprise features, pricing, onboarding) previously split out to
 * /product. This is deliberately separate from the signed-in-aware
 * gateway/dashboards, which live at /portal (see src/app/portal/page.tsx).
 * A handful of real `library_catalog()` resources are fetched here as a
 * preview; everything else that isn't database-backed (the subject
 * showcase grid, pricing, enterprise feature copy) is presented as
 * illustrative marketing content, not live data. */
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
