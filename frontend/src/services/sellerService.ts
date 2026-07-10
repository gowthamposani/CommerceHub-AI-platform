import { apiRequest } from "@/api/client";
import type {
  SellerCreatePayload,
  SellerListParams,
  SellerListResponse,
  SellerResponse,
  SellerUpdatePayload
} from "@/types/seller";

const SELLERS_ENDPOINT = "/sellers";

export function getSellers(params: SellerListParams) {
  return apiRequest<SellerListResponse>({
    method: "GET",
    url: SELLERS_ENDPOINT,
    params
  });
}

export function getSeller(sellerId: string) {
  return apiRequest<SellerResponse>({
    method: "GET",
    url: `${SELLERS_ENDPOINT}/${sellerId}`
  });
}

export function createSeller(payload: SellerCreatePayload) {
  return apiRequest<SellerResponse>({
    method: "POST",
    url: SELLERS_ENDPOINT,
    data: payload
  });
}

export function updateSeller(sellerId: string, payload: SellerUpdatePayload) {
  return apiRequest<SellerResponse>({
    method: "PUT",
    url: `${SELLERS_ENDPOINT}/${sellerId}`,
    data: payload
  });
}

export function activateSeller(sellerId: string) {
  return apiRequest<SellerResponse>({
    method: "PATCH",
    url: `${SELLERS_ENDPOINT}/${sellerId}/activate`
  });
}

export function deactivateSeller(sellerId: string) {
  return apiRequest<SellerResponse>({
    method: "PATCH",
    url: `${SELLERS_ENDPOINT}/${sellerId}/deactivate`
  });
}

export function deleteSeller(sellerId: string) {
  return apiRequest<SellerResponse>({
    method: "DELETE",
    url: `${SELLERS_ENDPOINT}/${sellerId}`
  });
}
