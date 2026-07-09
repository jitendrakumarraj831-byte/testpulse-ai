import type { Metadata } from "next";
import { DashboardControlCenter } from "@/components/admin/DashboardControlCenter";

export const metadata: Metadata = {
  title: "Admin Dashboard | TestPulse AI",
  description:
    "Live platform stats, recent student activity, and quick access to every AI admin tool.",
};

export default function AdminDashboardPage() {
  return <DashboardControlCenter />;
}
