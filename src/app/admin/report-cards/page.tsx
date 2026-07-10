import type { Metadata } from "next";
import { ReportCardPanel } from "@/components/admin/ReportCardPanel";

export const metadata: Metadata = {
  title: "Report Cards | TestPulse AI Admin",
  description: "Aggregate a student's real exam scores, attendance, and assignment grades into a printable report.",
};

export default function AdminReportCardsPage() {
  return <ReportCardPanel />;
}
