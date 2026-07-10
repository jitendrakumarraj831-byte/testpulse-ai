"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import type { PromotionalOffer } from "@/lib/offers/types";

const DISMISS_KEY = "testpulse:dismissed-offer";

interface OfferBannerProps {
  offers: PromotionalOffer[];
}

/** The dismissible strip at the very top of the public "/" homepage (above
 * the Navbar) — the only place `promotional_offers` rows are rendered.
 * `offers` is already filtered to currently-active, in-date-window rows by
 * the "Anyone can view currently active offers" RLS policy (see
 * schema.sql), so this component just picks the most recent one. Dismissal
 * is per-offer (keyed by id) and session-scoped, so a newly published
 * offer always shows even if an earlier one was dismissed. */
export function OfferBanner({ offers }: OfferBannerProps) {
  const offer = offers[0] ?? null;
  const [dismissedId, setDismissedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(DISMISS_KEY);
    } catch {
      return null;
    }
  });

  if (!offer || offer.id === dismissedId) return null;

  const dismiss = () => {
    setDismissedId(offer.id);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, offer.id);
    } catch {
      // sessionStorage unavailable — the banner just won't stay dismissed across reloads.
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-b border-cyan-500/30 bg-cyan-500/10"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2.5 lg:px-8">
          <Megaphone className="h-4 w-4 shrink-0 text-cyan-300" />
          <p className="min-w-0 flex-1 truncate text-sm text-cyan-100">
            <span className="font-semibold">{offer.title}</span>
            {offer.description && <span className="text-cyan-300/80"> — {offer.description}</span>}
          </p>
          {offer.resourceUrl && (
            <a
              href={offer.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm font-semibold text-cyan-200 underline-offset-2 hover:underline"
            >
              Learn more
            </a>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-cyan-300/70 transition-colors hover:bg-white/10 hover:text-cyan-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
