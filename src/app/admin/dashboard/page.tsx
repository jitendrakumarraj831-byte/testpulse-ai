import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardControlCenter } from "@/components/admin/DashboardControlCenter";

export const metadata: Metadata = {
  title: "Admin Dashboard | TestPulse AI",
  description:
    "Live platform stats, recent student activity, and quick access to every AI admin tool.",
};

export default function AdminDashboardPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader activeLabel="Dashboard" activePage="dashboard" />
      <DashboardControlCenter />
    </div>
  );
}
