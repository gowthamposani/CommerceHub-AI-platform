import type { ApiResponse } from "@/types/common";
import type { InventoryRecord, InventoryListMeta } from "@/types/inventory";

export type WarehouseStatus = "active" | "inactive" | "suspended" | "deleted";
export type WarehouseType = "fulfillment" | "storage" | "returns" | "cross_dock" | "dark_store";

export interface Warehouse {
  id: string;
  seller_id: string;
  warehouse_code: string;
  warehouse_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string | number | null;
  longitude: string | number | null;
  warehouse_type: WarehouseType;
  status: WarehouseStatus;
  is_default: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  seller_name: string | null;
}

export interface WarehouseListPayload {
  items: Warehouse[];
  meta: InventoryListMeta;
}

export interface WarehouseListParams {
  page: number;
  page_size: number;
  search?: string;
  seller_id?: string;
  status?: WarehouseStatus;
  warehouse_type?: WarehouseType;
  city?: string;
  state?: string;
  country?: string;
  is_default?: boolean;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface WarehouseCreatePayload {
  seller_id: string;
  warehouse_code: string;
  warehouse_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  warehouse_type: WarehouseType;
  status: WarehouseStatus;
  is_default: boolean;
}

export type WarehouseUpdatePayload = Partial<Omit<WarehouseCreatePayload, "seller_id" | "warehouse_code">>;

export interface WarehouseStatistics {
  total_warehouses: number;
  active_warehouses: number;
  inactive_warehouses: number;
  default_warehouses: number;
  inventory_records: number;
  total_available_quantity: number;
  total_reserved_quantity: number;
  total_damaged_quantity: number;
}

export interface WarehouseCapacity {
  warehouse_id: string;
  capacity_units: number | null;
  utilized_units: number;
  available_capacity_units: number | null;
  utilization_percentage: string | number | null;
}

export interface WarehouseInventorySummary {
  warehouse_id: string;
  inventory_records: number;
  unique_products: number;
  unique_variants: number;
  total_available_quantity: number;
  total_reserved_quantity: number;
  total_damaged_quantity: number;
  low_stock_records: number;
  out_of_stock_records: number;
}

export interface WarehouseDashboardMetrics {
  totalWarehouses: number;
  activeWarehouses: number;
  disabledWarehouses: number;
  defaultWarehouse: number;
  totalInventory: number;
  capacityUsed: number;
  capacityRemaining: number | null;
}

export interface WarehouseActivity {
  id: string;
  label: string;
  description: string;
  timestamp: string;
  type: "created" | "updated" | "status" | "default" | "inventory" | "transfer";
}

export interface WarehouseActivityListPayload {
  items: WarehouseActivity[];
}

export interface WarehouseTransferPayload {
  source_warehouse_id: string;
  destination_warehouse_id: string;
  inventory_id: string;
  quantity: number;
  reference_number?: string | null;
  remarks?: string | null;
}

export interface WarehouseTransferResult {
  source_inventory_id: string;
  destination_inventory_id: string;
  source_warehouse_id: string;
  destination_warehouse_id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  quantity: number;
  source_available_quantity: number;
  destination_available_quantity: number;
}

export type WarehouseResponse = ApiResponse<Warehouse>;
export type WarehouseListResponse = ApiResponse<WarehouseListPayload>;
export type WarehouseStatisticsResponse = ApiResponse<WarehouseStatistics>;
export type WarehouseCapacityResponse = ApiResponse<WarehouseCapacity>;
export type WarehouseInventorySummaryResponse = ApiResponse<WarehouseInventorySummary>;
export type WarehouseInventoryListResponse = ApiResponse<{ items: InventoryRecord[]; meta: InventoryListMeta }>;
export type WarehouseActivityListResponse = ApiResponse<WarehouseActivityListPayload>;
export type WarehouseTransferResponse = ApiResponse<WarehouseTransferResult>;
