import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { FileText, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { rowToDocument, type InstitutionalDocumentRow } from "@/lib/documents/types";

export const metadata: Metadata = {
  title: "Institutional Documents | TestPulse AI",
  description: "Circulars, policies, and notices published by your institute.",
};

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Signed-in-only (any role) — institutional documents aren't public, see
 * the "Signed-in users can view institutional documents" RLS policy in
 * schema.sql. Published via the admin Resource Control Center. */
export default async function StudentDocumentsPage() {
  noStore();

  if (!isSupabaseConfigured) {
    redirect("/auth/login?redirect=/student/documents");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/student/documents");
  }

  const { data } = await supabase
    .from("institutional_documents")
    .select("id, title, description, resource_url, created_at")
    .order("created_at", { ascending: false });

  const documents = ((data ?? []) as InstitutionalDocumentRow[]).map(rowToDocument);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 lg:px-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          <FileText className="h-3.5 w-3.5" />
          Institutional documents
        </div>
        <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Circulars &amp; Policies
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Official documents published by your institute.
        </p>
      </div>

      {documents.length === 0 && (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
          No documents published yet — check back once your institute posts one.
        </p>
      )}

      <div className="space-y-3">
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-glow group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30">
                <FileText className="h-4.5 w-4.5 text-violet-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{document.title}</p>
                {document.description && (
                  <p className="mt-1 text-sm text-slate-400">{document.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-600">{formatDate(document.createdAt)}</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-violet-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
