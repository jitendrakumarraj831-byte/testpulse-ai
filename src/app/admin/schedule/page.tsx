import type { Metadata } from "next";
import { SchedulePanel } from "@/components/admin/SchedulePanel";

export const metadata: Metadata = {
  title: "Schedule | TestPulse AI Admin",
  description: "Manage the institute's classes, exams, and events — including virtual class links.",
};

export default function AdminSchedulePage() {
  return <SchedulePanel />;
}
