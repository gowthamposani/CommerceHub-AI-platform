import { apiRequest } from "@/api/client";
import type {
  ProductCreatePayload,
  ProductListParams,
  ProductListResponse,
  ProductResponse,
  ProductUpdatePayload,
  PublishProductPayload
} from "@/types/product";

const PRODUCTS_ENDPOINT = "/products";

export function getProducts(params: ProductListParams) {
  return apiRequest<ProductListResponse>({
    method: "GET",
    url: PRODUCTS_ENDPOINT,
    params
  });
}

export function getProduct(productId: string) {
  return apiRequest<ProductResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}`
  });
}

export function getProductPreview(productId: string) {
  return apiRequest<ProductResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/preview`
  });
}

export function createProduct(payload: ProductCreatePayload) {
  return apiRequest<ProductResponse>({
    method: "POST",
    url: PRODUCTS_ENDPOINT,
    data: payload
  });
}

export function updateProduct(productId: string, payload: ProductUpdatePayload) {
  return apiRequest<ProductResponse>({
    method: "PUT",
    url: `${PRODUCTS_ENDPOINT}/${productId}`,
    data: payload
  });
}

export function publishProduct(productId: string, payload: PublishProductPayload) {
  return apiRequest<ProductResponse>({
    method: "PATCH",
    url: `${PRODUCTS_ENDPOINT}/${productId}/publish`,
    data: payload
  });
}

export function unpublishProduct(productId: string) {
  return apiRequest<ProductResponse>({
    method: "PATCH",
    url: `${PRODUCTS_ENDPOINT}/${productId}/unpublish`
  });
}

export function archiveProduct(productId: string) {
  return apiRequest<ProductResponse>({
    method: "PATCH",
    url: `${PRODUCTS_ENDPOINT}/${productId}/archive`
  });
}

export function duplicateProduct(productId: string) {
  return apiRequest<ProductResponse>({
    method: "POST",
    url: `${PRODUCTS_ENDPOINT}/${productId}/duplicate`
  });
}

export function deleteProduct(productId: string) {
  return apiRequest<ProductResponse>({
    method: "DELETE",
    url: `${PRODUCTS_ENDPOINT}/${productId}`
  });
}
