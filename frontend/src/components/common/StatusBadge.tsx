import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status }: { status: "active" | "inactive" | "pending" | "error" }) {
  const tone =
    status === "active" ? "success" : status === "pending" ? "warning" : status === "error" ? "danger" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}
