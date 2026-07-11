import type { InventoryStatus } from "@/types/inventory";

export const INVENTORY_STATUS_OPTIONS: Array<{ label: string; value: InventoryStatus }> = [
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock", value: "low_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
  { label: "Inactive", value: "inactive" }
];

export const INVENTORY_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Available Quantity", value: "available_quantity" },
  { label: "Reserved Quantity", value: "reserved_quantity" },
  { label: "SKU", value: "sku" },
  { label: "Status", value: "status" }
];

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  inactive: "Inactive",
  deleted: "Deleted"
};
