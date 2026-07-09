import type { Metadata } from "next";
import { FeeLedgerPanel } from "@/components/admin/FeeLedgerPanel";

export const metadata: Metadata = {
  title: "Fee Ledger | TestPulse AI Admin",
  description: "Record fee payments and generate receipts.",
};

export default function AdminFeesPage() {
  return <FeeLedgerPanel />;
}
