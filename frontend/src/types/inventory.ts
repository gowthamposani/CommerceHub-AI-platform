import type { ApiResponse } from "@/types/common";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "inactive" | "deleted";
export type InventoryTransactionType =
  "stock_in" | "stock_out" | "adjustment" | "reservation" | "reservation_release" | "manual_correction";

export interface InventoryRecord {
  id: string;
  product_id: string;
  variant_id: string;
  warehouse_id?: string | null;
  sku: string;
  available_quantity: number;
  reserved_quantity: number;
  damaged_quantity: number;
  minimum_stock: number;
  maximum_stock: number | null;
  reorder_level: number;
  status: InventoryStatus;
  transfer_ready: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  product_name: string | null;
  category_name: string | null;
  brand_name: string | null;
  seller_name: string | null;
  variant_signature: string | null;
  image_url?: string | null;
  unit_price?: string | number | null;
}

export interface InventoryListMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface InventoryListPayload {
  items: InventoryRecord[];
  meta: InventoryListMeta;
}

export interface InventoryListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: InventoryStatus;
  low_stock?: boolean;
  out_of_stock?: boolean;
  category_id?: string;
  brand_id?: string;
  seller_id?: string;
  warehouse_id?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface InventoryCreatePayload {
  product_id: string;
  variant_id: string;
  available_quantity: number;
  reserved_quantity?: number;
  damaged_quantity?: number;
  minimum_stock?: number;
  maximum_stock?: number | null;
  reorder_level?: number;
  transfer_ready?: boolean;
  warehouse_id?: string | null;
}

export interface InventoryUpdatePayload {
  minimum_stock?: number;
  maximum_stock?: number | null;
  reorder_level?: number;
  transfer_ready?: boolean;
}

export interface InventoryOperationPayload {
  quantity: number;
  reference_number?: string | null;
  remarks?: string | null;
  performed_by?: string | null;
}

export interface InventoryAdjustmentPayload {
  available_quantity: number;
  damaged_quantity?: number | null;
  reference_number?: string | null;
  remarks?: string | null;
  performed_by?: string | null;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  previous_quantity: number;
  current_quantity: number;
  reference_number: string | null;
  remarks: string | null;
  performed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryHistoryPayload {
  items: InventoryTransaction[];
  meta: InventoryListMeta;
}

export interface InventoryReservation {
  id: string;
  inventory_id: string;
  quantity: number;
  status: string;
  reference_number: string | null;
  remarks: string | null;
  performed_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface InventoryDashboardMetrics {
  totalProducts: number;
  totalStockUnits: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number | null;
}

export type InventoryResponse = ApiResponse<InventoryRecord>;
export type InventoryListResponse = ApiResponse<InventoryListPayload>;
export type InventoryHistoryResponse = ApiResponse<InventoryHistoryPayload>;
export type InventoryReservationResponse = ApiResponse<InventoryReservation>;
