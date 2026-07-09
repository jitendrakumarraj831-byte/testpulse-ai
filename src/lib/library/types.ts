export type LibraryCategory = "book" | "notes" | "catalog";
export type LibraryAccessLevel = "free" | "premium";

export interface LibraryResource {
  id: string;
  title: string;
  description: string;
  category: LibraryCategory;
  access_level: LibraryAccessLevel;
  /** Null when this is a premium resource and the viewer isn't signed in —
   * masked server-side by the `library_catalog()` RPC (see schema.sql), not
   * by anything in the browser, so there's no real link to redact here. */
  file_url: string | null;
  created_at: string;
}

export const LIBRARY_CATEGORIES: { value: LibraryCategory; label: string }[] = [
  { value: "book", label: "Books" },
  { value: "notes", label: "Chapter Notes" },
  { value: "catalog", label: "Premium Catalogs" },
];
