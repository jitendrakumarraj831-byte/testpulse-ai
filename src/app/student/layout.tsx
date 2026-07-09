import type { ReactNode } from "react";
import { StudentAppHeader } from "@/components/student/StudentAppHeader";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="glow-field flex min-h-screen flex-1 flex-col bg-slate-950">
      <StudentAppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
