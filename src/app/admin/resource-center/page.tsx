import type { Metadata } from "next";
import { ResourceControlCenter } from "@/components/admin/ResourceControlCenter";

export const metadata: Metadata = {
  title: "Resource Control Center | TestPulse AI Admin",
  description: "Publish study resources, active offers, and institutional documents — one at a time or in bulk.",
};

export default function AdminResourceCenterPage() {
  return <ResourceControlCenter />;
}
