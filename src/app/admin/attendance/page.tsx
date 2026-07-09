import type { Metadata } from "next";
import { AttendancePanel } from "@/components/admin/AttendancePanel";

export const metadata: Metadata = {
  title: "Attendance | TestPulse AI Admin",
  description: "Mark and review student attendance by day and batch.",
};

export default function AdminAttendancePage() {
  return <AttendancePanel />;
}
