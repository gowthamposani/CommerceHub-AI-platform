import { Badge } from "@/components/ui/Badge";
import { WAREHOUSE_STATUS_LABELS } from "@/constants/warehouse";
import type { WarehouseStatus } from "@/types/warehouse";

const tones: Record<WarehouseStatus, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  suspended: "warning",
  deleted: "danger"
};

export function WarehouseStatusBadge({ status }: { status: WarehouseStatus }) {
  return <Badge tone={tones[status]}>{WAREHOUSE_STATUS_LABELS[status]}</Badge>;
}
