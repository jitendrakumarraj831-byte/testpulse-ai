import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UploadQuestionsPanel } from "@/components/admin/UploadQuestionsPanel";

export const metadata: Metadata = {
  title: "Upload Questions | TestPulse AI Admin",
  description:
    "Bulk import questions from Excel, CSV, or pasted plain text, validate them, and publish straight to the database.",
};

export default function UploadQuestionsPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader activeLabel="Upload Questions" activePage="uploader" />
      <UploadQuestionsPanel />
    </div>
  );
}
