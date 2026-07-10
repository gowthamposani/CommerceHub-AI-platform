import { Badge } from "@/components/ui/Badge";
import { INVENTORY_STATUS_LABELS } from "@/constants/inventory";
import type { InventoryStatus } from "@/types/inventory";

function toneForStatus(status: InventoryStatus) {
  if (status === "in_stock") return "success";
  if (status === "low_stock") return "warning";
  if (status === "out_of_stock" || status === "deleted") return "danger";
  return "neutral";
}

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  return <Badge tone={toneForStatus(status)}>{INVENTORY_STATUS_LABELS[status]}</Badge>;
}
