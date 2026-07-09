import type { Metadata } from "next";
import { UploadQuestionsPanel } from "@/components/admin/UploadQuestionsPanel";

export const metadata: Metadata = {
  title: "Upload Questions | TestPulse AI Admin",
  description:
    "Bulk import questions from Excel, CSV, or pasted plain text, validate them, and publish straight to the database.",
};

export default function UploadQuestionsPage() {
  return <UploadQuestionsPanel />;
}
