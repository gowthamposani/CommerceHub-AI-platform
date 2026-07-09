import { apiRequest } from "@/api/client";
import type {
  WarehouseActivityListResponse,
  WarehouseCapacityResponse,
  WarehouseCreatePayload,
  WarehouseInventoryListResponse,
  WarehouseInventorySummaryResponse,
  WarehouseListParams,
  WarehouseListResponse,
  WarehouseResponse,
  WarehouseStatisticsResponse,
  WarehouseTransferPayload,
  WarehouseTransferResponse,
  WarehouseUpdatePayload
} from "@/types/warehouse";

const WAREHOUSE_ENDPOINT = "/warehouses";

export function getWarehouses(params: WarehouseListParams) {
  return apiRequest<WarehouseListResponse>({
    method: "GET",
    url: WAREHOUSE_ENDPOINT,
    params
  });
}

export function getWarehouseById(warehouseId: string) {
  return apiRequest<WarehouseResponse>({
    method: "GET",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}`
  });
}

export function createWarehouse(payload: WarehouseCreatePayload) {
  return apiRequest<WarehouseResponse>({
    method: "POST",
    url: WAREHOUSE_ENDPOINT,
    data: payload
  });
}

export function updateWarehouse(warehouseId: string, payload: WarehouseUpdatePayload) {
  return apiRequest<WarehouseResponse>({
    method: "PUT",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}`,
    data: payload
  });
}

export function deleteWarehouse(warehouseId: string) {
  return apiRequest<WarehouseResponse>({
    method: "DELETE",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}`
  });
}

export function setDefaultWarehouse(warehouseId: string) {
  return apiRequest<WarehouseResponse>({
    method: "PATCH",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}/default`
  });
}

export function updateWarehouseStatus(warehouseId: string, status: string) {
  return apiRequest<WarehouseResponse>({
    method: "PATCH",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}/status`,
    data: { status }
  });
}

export function getWarehouseStatistics(sellerId?: string) {
  return apiRequest<WarehouseStatisticsResponse>({
    method: "GET",
    url: `${WAREHOUSE_ENDPOINT}/statistics`,
    params: sellerId ? { seller_id: sellerId } : undefined
  });
}

export function getWarehouseCapacity(warehouseId: string) {
  return apiRequest<WarehouseCapacityResponse>({
    method: "GET",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}/capacity`
  });
}

export function getWarehouseInventorySummary(warehouseId: string) {
  return apiRequest<WarehouseInventorySummaryResponse>({
    method: "GET",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}/inventory-summary`
  });
}

export function getWarehouseInventory(warehouseId: string, params: { page: number; page_size: number }) {
  return apiRequest<WarehouseInventoryListResponse>({
    method: "GET",
    url: "/inventory",
    params: { ...params, warehouse_id: warehouseId }
  });
}

export function transferWarehouseInventory(payload: WarehouseTransferPayload) {
  return apiRequest<WarehouseTransferResponse>({
    method: "POST",
    url: `${WAREHOUSE_ENDPOINT}/transfers`,
    data: payload
  });
}

export function getWarehouseActivity(warehouseId: string) {
  return apiRequest<WarehouseActivityListResponse>({
    method: "GET",
    url: `${WAREHOUSE_ENDPOINT}/${warehouseId}/activity`
  });
}
