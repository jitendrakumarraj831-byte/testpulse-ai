"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FileText,
  Loader2,
  Megaphone,
  Plus,
  UploadCloud,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { QuestionDropZone } from "@/components/admin/QuestionDropZone";
import { parseSpreadsheetFile } from "@/lib/admin/file-parser";
import { LIBRARY_CATEGORIES, type LibraryCategory, type LibraryAccessLevel } from "@/lib/library/types";
import { rowToOffer, type PromotionalOffer, type PromotionalOfferRow } from "@/lib/offers/types";
import { rowToDocument, type InstitutionalDocument, type InstitutionalDocumentRow } from "@/lib/documents/types";

type CatalogType = "study_resource" | "offer" | "document";

const CATALOG_TYPE_LABEL: Record<CatalogType, string> = {
  study_resource: "Study Resource (Book/Notes)",
  offer: "Active Offer & Banner",
  document: "Institutional Document",
};

const ACCESS_LEVELS: { value: LibraryAccessLevel; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

interface StudyResourceRow {
  id: string;
  title: string;
  description: string;
  category: LibraryCategory;
  access_level: LibraryAccessLevel;
  file_url: string;
  created_at: string;
}

/** Accepted values for the bulk uploader's `catalog_type` column — the
 * three "study resource" sub-types route into `resources` (matching its
 * existing category enum), 'offer'/'document' route into their own
 * tables. See the schema.sql comment above promotional_offers for why
 * these three concepts don't share one table. */
const BULK_TYPE_TO_TABLE: Record<string, "resources" | "promotional_offers" | "institutional_documents"> = {
  book: "resources",
  notes: "resources",
  catalog: "resources",
  offer: "promotional_offers",
  document: "institutional_documents",
};

interface BulkRowResult {
  rowNumber: number;
  title: string;
  catalogType: string;
  isValid: boolean;
  issue: string | null;
}

function readField(row: Record<string, unknown>, ...keys: string[]): string {
  const lowerMap = new Map(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]));
  for (const key of keys) {
    const value = lowerMap.get(key);
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ResourceControlCenter() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);

  const [catalogType, setCatalogType] = useState<CatalogType>("study_resource");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [studyCategory, setStudyCategory] = useState<LibraryCategory>("notes");
  const [accessLevel, setAccessLevel] = useState<LibraryAccessLevel>("free");
  const [offerActive, setOfferActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [studyResources, setStudyResources] = useState<StudyResourceRow[]>([]);
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [documents, setDocuments] = useState<InstitutionalDocument[]>([]);

  const [isParsingFile, setIsParsingFile] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkRowResult[]>([]);
  const [bulkRawRows, setBulkRawRows] = useState<Record<string, unknown>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const loadAll = async () => {
    if (!supabase) return;
    const [resourcesRes, offersRes, documentsRes] = await Promise.all([
      supabase
        .from("resources")
        .select("id, title, description, category, access_level, file_url, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("promotional_offers")
        .select("id, title, description, resource_url, is_active, starts_at, ends_at, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("institutional_documents")
        .select("id, title, description, resource_url, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (resourcesRes.data) setStudyResources(resourcesRes.data as StudyResourceRow[]);
    if (offersRes.data) setOffers((offersRes.data as PromotionalOfferRow[]).map(rowToOffer));
    if (documentsRes.data) setDocuments((documentsRes.data as InstitutionalDocumentRow[]).map(rowToDocument));
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setResourceUrl("");
    setStudyCategory("notes");
    setAccessLevel("free");
    setOfferActive(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (catalogType !== "offer" && !resourceUrl.trim()) {
      setFormError("A resource URL is required for this catalog type.");
      return;
    }

    setIsSaving(true);
    let error: { message: string } | null = null;

    if (catalogType === "study_resource") {
      ({ error } = await supabase.from("resources").insert({
        title: title.trim(),
        description: description.trim(),
        category: studyCategory,
        access_level: accessLevel,
        file_url: resourceUrl.trim(),
      }));
    } else if (catalogType === "offer") {
      ({ error } = await supabase.from("promotional_offers").insert({
        title: title.trim(),
        description: description.trim(),
        resource_url: resourceUrl.trim() || null,
        is_active: offerActive,
      }));
    } else {
      ({ error } = await supabase.from("institutional_documents").insert({
        title: title.trim(),
        description: description.trim(),
        resource_url: resourceUrl.trim(),
      }));
    }

    setIsSaving(false);

    if (error) {
      setFormError("Couldn't save this entry. Make sure you're signed in as an admin.");
      return;
    }

    setFormSuccess(`${CATALOG_TYPE_LABEL[catalogType]} added.`);
    resetForm();
    void loadAll();
  };

  const handleBulkFile = async (file: File) => {
    setBulkError(null);
    setBulkSummary(null);
    setIsParsingFile(true);
    try {
      const rows = await parseSpreadsheetFile(file);
      if (rows.length === 0) throw new Error("No rows found in that file.");

      const results: BulkRowResult[] = rows.map((row, index) => {
        const rowTitle = readField(row, "title");
        const rowCatalogType = readField(row, "catalog_type", "catalogtype", "type").toLowerCase();
        const rowUrl = readField(row, "resource_url", "resourceurl", "url");

        if (!rowTitle) {
          return { rowNumber: index + 2, title: "(untitled)", catalogType: rowCatalogType, isValid: false, issue: "Missing title." };
        }
        const targetTable = BULK_TYPE_TO_TABLE[rowCatalogType];
        if (!targetTable) {
          return {
            rowNumber: index + 2,
            title: rowTitle,
            catalogType: rowCatalogType || "(blank)",
            isValid: false,
            issue: "catalog_type must be one of: book, notes, catalog, offer, document.",
          };
        }
        if (targetTable !== "promotional_offers" && !rowUrl) {
          return { rowNumber: index + 2, title: rowTitle, catalogType: rowCatalogType, isValid: false, issue: "Missing resource_url." };
        }
        return { rowNumber: index + 2, title: rowTitle, catalogType: rowCatalogType, isValid: true, issue: null };
      });

      setBulkRawRows(rows);
      setBulkResults(results);
    } catch (error) {
      console.error("Failed to parse bulk upload file:", error);
      setBulkError(
        error instanceof Error ? error.message : "We couldn't read that file. Please check the format and try again.",
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleBulkImport = async () => {
    if (!supabase) return;
    setBulkError(null);
    setIsImporting(true);

    const resourceRows: Record<string, unknown>[] = [];
    const offerRows: Record<string, unknown>[] = [];
    const documentRows: Record<string, unknown>[] = [];

    bulkResults.forEach((result, index) => {
      if (!result.isValid) return;
      const raw = bulkRawRows[index];
      const rowTitle = readField(raw, "title");
      const rowDescription = readField(raw, "description");
      const rowUrl = readField(raw, "resource_url", "resourceurl", "url");
      const targetTable = BULK_TYPE_TO_TABLE[result.catalogType];

      if (targetTable === "resources") {
        resourceRows.push({
          title: rowTitle,
          description: rowDescription,
          category: result.catalogType as LibraryCategory,
          access_level: "free",
          file_url: rowUrl,
        });
      } else if (targetTable === "promotional_offers") {
        offerRows.push({ title: rowTitle, description: rowDescription, resource_url: rowUrl || null, is_active: true });
      } else {
        documentRows.push({ title: rowTitle, description: rowDescription, resource_url: rowUrl });
      }
    });

    const errors: string[] = [];
    let insertedCount = 0;

    if (resourceRows.length > 0) {
      const { error } = await supabase.from("resources").insert(resourceRows);
      if (error) errors.push(`Study resources: ${error.message}`);
      else insertedCount += resourceRows.length;
    }
    if (offerRows.length > 0) {
      const { error } = await supabase.from("promotional_offers").insert(offerRows);
      if (error) errors.push(`Offers: ${error.message}`);
      else insertedCount += offerRows.length;
    }
    if (documentRows.length > 0) {
      const { error } = await supabase.from("institutional_documents").insert(documentRows);
      if (error) errors.push(`Documents: ${error.message}`);
      else insertedCount += documentRows.length;
    }

    setIsImporting(false);

    const skippedCount = bulkResults.length - (resourceRows.length + offerRows.length + documentRows.length);
    if (errors.length > 0) {
      setBulkError(
        `${insertedCount} row(s) imported. Some batches failed — fix and re-upload just those rows: ${errors.join("; ")}`,
      );
    } else {
      setBulkSummary(
        `${insertedCount} row(s) imported successfully.` +
          (skippedCount > 0 ? ` ${skippedCount} row(s) skipped due to validation errors.` : ""),
      );
      setBulkResults([]);
      setBulkRawRows([]);
      void loadAll();
    }
  };

  const validBulkCount = bulkResults.filter((row) => row.isValid).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <Boxes className="h-5 w-5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-glow text-2xl font-bold text-white sm:text-3xl">Resource Control Center</h1>
            <p className="mt-1 text-sm text-slate-500">
              Publish study resources, active offers, and institutional documents — one at a time or in bulk.
            </p>
          </div>
        </div>
      </motion.div>

      {!supabase && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-500">
          Supabase isn&apos;t configured in this environment, so the control center can&apos;t load —
          expected in local/preview setups without env vars set.
        </p>
      )}

      {supabase && (
        <>
          <form
            onSubmit={handleSubmit}
            className="card-glow relative space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md"
          >
            <CornerBrackets colorClass="text-cyan-400/50" alwaysVisible />

            <div>
              <label htmlFor="catalog-type" className="text-sm font-medium text-slate-300">
                Catalog Type
              </label>
              <select
                id="catalog-type"
                value={catalogType}
                onChange={(event) => setCatalogType(event.target.value as CatalogType)}
                className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
              >
                {(Object.entries(CATALOG_TYPE_LABEL) as [CatalogType, string][]).map(([value, label]) => (
                  <option key={value} value={value} className="bg-slate-900">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rcc-title" className="text-sm font-medium text-slate-300">Title</label>
                <input
                  id="rcc-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Rotational Dynamics — Chapter Notes"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label htmlFor="rcc-url" className="text-sm font-medium text-slate-300">
                  {catalogType === "offer" ? "Link URL " : "Resource URL "}
                  <span className="text-slate-600">{catalogType === "offer" ? "(optional)" : ""}</span>
                </label>
                <input
                  id="rcc-url"
                  type="url"
                  value={resourceUrl}
                  onChange={(event) => setResourceUrl(event.target.value)}
                  placeholder="https://…"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {catalogType === "study_resource" && (
                <>
                  <div>
                    <label htmlFor="rcc-category" className="text-sm font-medium text-slate-300">Resource Category</label>
                    <select
                      id="rcc-category"
                      value={studyCategory}
                      onChange={(event) => setStudyCategory(event.target.value as LibraryCategory)}
                      className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                    >
                      {LIBRARY_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value} className="bg-slate-900">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rcc-access" className="text-sm font-medium text-slate-300">Access Level</label>
                    <select
                      id="rcc-access"
                      value={accessLevel}
                      onChange={(event) => setAccessLevel(event.target.value as LibraryAccessLevel)}
                      className="mt-2 w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                    >
                      {ACCESS_LEVELS.map((level) => (
                        <option key={level.value} value={level.value} className="bg-slate-900">
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {catalogType === "offer" && (
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 text-sm font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={offerActive}
                      onChange={(event) => setOfferActive(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950/60 text-cyan-500 focus:ring-cyan-500/40"
                    />
                    Active now (shows on the public banner immediately)
                  </label>
                </div>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="rcc-description" className="text-sm font-medium text-slate-300">
                  Description <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  id="rcc-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {formError && (
              <p className="flex items-center gap-2 text-sm text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {formSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(6,182,212,0.7)] transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Publish
            </button>
          </form>

          <div className="card-glow relative space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <CornerBrackets colorClass="text-violet-400/50" alwaysVisible />
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/30">
                <UploadCloud className="h-4.5 w-4.5 text-violet-400" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">Bulk Import</h2>
                <p className="text-xs text-slate-500">
                  Columns: <code className="rounded bg-slate-800 px-1 py-0.5">title</code>,{" "}
                  <code className="rounded bg-slate-800 px-1 py-0.5">description</code>,{" "}
                  <code className="rounded bg-slate-800 px-1 py-0.5">catalog_type</code> (book / notes / catalog / offer / document),{" "}
                  <code className="rounded bg-slate-800 px-1 py-0.5">resource_url</code>
                </p>
              </div>
            </div>

            <QuestionDropZone isProcessing={isParsingFile} onFile={(file) => void handleBulkFile(file)} />

            {bulkError && (
              <p className="flex items-center gap-2 text-sm text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {bulkError}
              </p>
            )}
            {bulkSummary && (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {bulkSummary}
              </p>
            )}

            {bulkResults.length > 0 && (
              <div className="space-y-3">
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800">
                  {bulkResults.map((row) => (
                    <div
                      key={row.rowNumber}
                      className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-4 py-2.5 text-sm last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-slate-200">
                          Row {row.rowNumber} · {row.title}
                        </p>
                        {row.issue && <p className="text-xs text-rose-400">{row.issue}</p>}
                      </div>
                      {row.isValid ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-400">
                    {validBulkCount} of {bulkResults.length} rows ready to import.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleBulkImport()}
                    disabled={isImporting || validBulkCount === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] transition-all hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    Confirm & Import {validBulkCount} Row{validBulkCount === 1 ? "" : "s"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
                <FileText className="h-4 w-4 text-cyan-400" />
                <p className="text-sm font-semibold text-white">Study Resources ({studyResources.length})</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {studyResources.length === 0 && <p className="p-5 text-sm text-slate-500">None published yet.</p>}
                {studyResources.map((resource) => (
                  <div key={resource.id} className="border-b border-slate-800/60 px-5 py-3 last:border-0">
                    <p className="truncate text-sm font-medium text-white">{resource.title}</p>
                    <p className="text-xs text-slate-500">
                      {resource.category} · {resource.access_level} · {formatDate(resource.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
                <Megaphone className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Offers & Banners ({offers.length})</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {offers.length === 0 && <p className="p-5 text-sm text-slate-500">None published yet.</p>}
                {offers.map((offer) => (
                  <div key={offer.id} className="border-b border-slate-800/60 px-5 py-3 last:border-0">
                    <p className="truncate text-sm font-medium text-white">{offer.title}</p>
                    <p className="text-xs text-slate-500">
                      {offer.isActive ? "Active" : "Inactive"} · {formatDate(offer.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
                <FileText className="h-4 w-4 text-violet-400" />
                <p className="text-sm font-semibold text-white">Institutional Documents ({documents.length})</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {documents.length === 0 && <p className="p-5 text-sm text-slate-500">None published yet.</p>}
                {documents.map((document) => (
                  <div key={document.id} className="border-b border-slate-800/60 px-5 py-3 last:border-0">
                    <p className="truncate text-sm font-medium text-white">{document.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(document.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
