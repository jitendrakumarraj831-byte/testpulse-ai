import type { Metadata } from "next";
import { FeeDuesPanel } from "@/components/admin/FeeDuesPanel";
import { FeeLedgerPanel } from "@/components/admin/FeeLedgerPanel";

export const metadata: Metadata = {
  title: "Fees | TestPulse AI Admin",
  description: "Raise fee dues, collect online payments, and record receipts.",
};

export default function AdminFeesPage() {
  return (
    <div>
      <FeeDuesPanel />
      <FeeLedgerPanel />
    </div>
  );
}
