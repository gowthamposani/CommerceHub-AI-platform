import { apiRequest } from "@/api/client";
import type {
  InventoryAdjustmentPayload,
  InventoryCreatePayload,
  InventoryHistoryResponse,
  InventoryListParams,
  InventoryListResponse,
  InventoryOperationPayload,
  InventoryReservationResponse,
  InventoryResponse,
  InventoryUpdatePayload
} from "@/types/inventory";

const INVENTORY_ENDPOINT = "/inventory";

export function getInventory(params: InventoryListParams) {
  return apiRequest<InventoryListResponse>({
    method: "GET",
    url: INVENTORY_ENDPOINT,
    params
  });
}

export function getInventoryById(inventoryId: string) {
  return apiRequest<InventoryResponse>({
    method: "GET",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}`
  });
}

export function createInventory(payload: InventoryCreatePayload) {
  return apiRequest<InventoryResponse>({
    method: "POST",
    url: INVENTORY_ENDPOINT,
    data: payload
  });
}

export function updateInventory(inventoryId: string, payload: InventoryUpdatePayload) {
  return apiRequest<InventoryResponse>({
    method: "PUT",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}`,
    data: payload
  });
}

export function deleteInventory(inventoryId: string) {
  return apiRequest<InventoryResponse>({
    method: "DELETE",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}`
  });
}

export function stockInInventory(inventoryId: string, payload: InventoryOperationPayload) {
  return apiRequest<InventoryResponse>({
    method: "POST",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/stock-in`,
    data: payload
  });
}

export function stockOutInventory(inventoryId: string, payload: InventoryOperationPayload) {
  return apiRequest<InventoryResponse>({
    method: "POST",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/stock-out`,
    data: payload
  });
}

export function reserveInventory(inventoryId: string, payload: InventoryOperationPayload) {
  return apiRequest<InventoryReservationResponse>({
    method: "POST",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/reserve`,
    data: payload
  });
}

export function releaseInventory(inventoryId: string, payload: InventoryOperationPayload) {
  return apiRequest<InventoryResponse>({
    method: "POST",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/release`,
    data: payload
  });
}

export function adjustInventory(inventoryId: string, payload: InventoryAdjustmentPayload) {
  return apiRequest<InventoryResponse>({
    method: "POST",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/adjust`,
    data: payload
  });
}

export function getInventoryHistory(inventoryId: string, params: { page: number; page_size: number }) {
  return apiRequest<InventoryHistoryResponse>({
    method: "GET",
    url: `${INVENTORY_ENDPOINT}/${inventoryId}/history`,
    params
  });
}
