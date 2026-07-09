import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StudentDirectory } from "@/components/admin/StudentDirectory";

export const metadata: Metadata = {
  title: "Manage Students | TestPulse AI Admin",
  description:
    "A live directory of every student who has submitted a test, with real accuracy and streak data.",
};

export default function ManageStudentsPage() {
  return (
    <div className="glow-field min-h-screen bg-slate-950">
      <AdminHeader activeLabel="Manage Students" activePage="students" />
      <StudentDirectory />
    </div>
  );
}
