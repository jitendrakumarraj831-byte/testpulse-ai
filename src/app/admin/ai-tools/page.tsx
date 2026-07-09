import type { Metadata } from "next";
import { AIToolsHub } from "@/components/admin/AIToolsHub";

export const metadata: Metadata = {
  title: "AI Tools | TestPulse AI Admin",
  description:
    "Generate a new exam with AI, or extract structured questions from text you already have.",
};

export default function AIToolsPage() {
  return <AIToolsHub />;
}
