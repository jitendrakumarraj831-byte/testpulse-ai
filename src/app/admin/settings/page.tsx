import type { Metadata } from "next";
import { SystemSettingsPanel } from "@/components/admin/SystemSettingsPanel";

export const metadata: Metadata = {
  title: "System Settings | TestPulse AI Admin",
  description: "Institute-wide platform controls, including AI Proctoring and parent reports.",
};

export default function AdminSettingsPage() {
  return <SystemSettingsPanel />;
}
