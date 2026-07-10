import type { Option } from "@/types/common";
import type { WarehouseStatus, WarehouseType } from "@/types/warehouse";

export const WAREHOUSE_STATUS_LABELS: Record<WarehouseStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  deleted: "Deleted"
};

export const WAREHOUSE_TYPE_LABELS: Record<WarehouseType, string> = {
  fulfillment: "Fulfillment",
  storage: "Storage",
  returns: "Returns",
  cross_dock: "Cross Dock",
  dark_store: "Dark Store"
};

export const WAREHOUSE_STATUS_OPTIONS: Option[] = [
  { label: WAREHOUSE_STATUS_LABELS.active, value: "active" },
  { label: WAREHOUSE_STATUS_LABELS.inactive, value: "inactive" },
  { label: WAREHOUSE_STATUS_LABELS.suspended, value: "suspended" }
];

export const WAREHOUSE_TYPE_OPTIONS: Option[] = [
  { label: WAREHOUSE_TYPE_LABELS.fulfillment, value: "fulfillment" },
  { label: WAREHOUSE_TYPE_LABELS.storage, value: "storage" },
  { label: WAREHOUSE_TYPE_LABELS.returns, value: "returns" },
  { label: WAREHOUSE_TYPE_LABELS.cross_dock, value: "cross_dock" },
  { label: WAREHOUSE_TYPE_LABELS.dark_store, value: "dark_store" }
];

export const WAREHOUSE_SORT_OPTIONS: Option[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Warehouse Name", value: "warehouse_name" },
  { label: "Warehouse Code", value: "warehouse_code" },
  { label: "City", value: "city" },
  { label: "Status", value: "status" }
];
