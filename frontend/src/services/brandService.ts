import { apiRequest } from "@/api/client";
import type {
  BrandCreatePayload,
  BrandListParams,
  BrandListResponse,
  BrandResponse,
  BrandUpdatePayload
} from "@/types/brand";

const BRANDS_ENDPOINT = "/brands";

export function getBrands(params: BrandListParams) {
  return apiRequest<BrandListResponse>({
    method: "GET",
    url: BRANDS_ENDPOINT,
    params
  });
}

export function getBrand(brandId: string) {
  return apiRequest<BrandResponse>({
    method: "GET",
    url: `${BRANDS_ENDPOINT}/${brandId}`
  });
}

export function createBrand(payload: BrandCreatePayload) {
  return apiRequest<BrandResponse>({
    method: "POST",
    url: BRANDS_ENDPOINT,
    data: payload
  });
}

export function updateBrand(brandId: string, payload: BrandUpdatePayload) {
  return apiRequest<BrandResponse>({
    method: "PUT",
    url: `${BRANDS_ENDPOINT}/${brandId}`,
    data: payload
  });
}

export function activateBrand(brandId: string) {
  return apiRequest<BrandResponse>({
    method: "PATCH",
    url: `${BRANDS_ENDPOINT}/${brandId}/activate`
  });
}

export function deactivateBrand(brandId: string) {
  return apiRequest<BrandResponse>({
    method: "PATCH",
    url: `${BRANDS_ENDPOINT}/${brandId}/deactivate`
  });
}

export function deleteBrand(brandId: string) {
  return apiRequest<BrandResponse>({
    method: "DELETE",
    url: `${BRANDS_ENDPOINT}/${brandId}`
  });
}
