import type { Metadata } from "next";
import { AssignmentsPanel } from "@/components/admin/AssignmentsPanel";

export const metadata: Metadata = {
  title: "Assignments | TestPulse AI Admin",
  description: "Create homework assignments and grade student submissions.",
};

export default function AdminAssignmentsPage() {
  return <AssignmentsPanel />;
}
