"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Library, Search } from "lucide-react";
import { LIBRARY_CATEGORIES, type LibraryCategory, type LibraryResource } from "@/lib/library/types";
import { ResourceCard } from "@/components/library/ResourceCard";

interface LibraryGridProps {
  resources: LibraryResource[];
  isConfigured: boolean;
}

type CategoryFilter = "all" | LibraryCategory;

export function LibraryGrid({ resources, isConfigured }: LibraryGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (categoryFilter !== "all" && resource.category !== categoryFilter) return false;
      if (!trimmedQuery) return true;
      return (
        resource.title.toLowerCase().includes(trimmedQuery) ||
        resource.description.toLowerCase().includes(trimmedQuery)
      );
    });
  }, [resources, categoryFilter, query]);

  const tabs: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "All Resources" },
    ...LIBRARY_CATEGORIES,
  ];

  return (
    <section className="px-6 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <Library className="h-3.5 w-3.5" />
            Reading Room
          </div>
          <h1 className="text-glow mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Digital Library
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Books, chapter notes, and premium catalogs curated for your
            institute — filter by category or search to find what you need.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setCategoryFilter(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  categoryFilter === tab.value
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-slate-700 bg-white/5 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or description…"
              className="w-full rounded-full border border-slate-700 bg-slate-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {!isConfigured && (
          <p className="mt-10 text-sm text-slate-600">
            Supabase isn&apos;t configured in this environment, so the
            library can&apos;t load — this is expected in local/preview
            setups without env vars set.
          </p>
        )}

        {isConfigured && resources.length === 0 && (
          <p className="mt-10 text-sm text-slate-600">
            No resources have been published to the library yet.
          </p>
        )}

        {isConfigured && resources.length > 0 && filtered.length === 0 && (
          <p className="mt-10 text-sm text-slate-600">
            No resources match &quot;{query}&quot;
            {categoryFilter !== "all" ? " in this category" : ""}.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
