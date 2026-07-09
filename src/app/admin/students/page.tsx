import type { Metadata } from "next";
import { StudentDirectory } from "@/components/admin/StudentDirectory";

export const metadata: Metadata = {
  title: "Manage Students | TestPulse AI Admin",
  description:
    "A live directory of every student who has submitted a test, with real accuracy and streak data.",
};

export default function ManageStudentsPage() {
  return <StudentDirectory />;
}
