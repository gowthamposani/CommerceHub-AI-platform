import { apiRequest } from "@/api/client";
import type {
  ProductAttributeListResponse,
  ProductAttributePayload,
  ProductAttributeResponse,
  ProductExtensionPreviewResponse,
  ProductSeoPayload,
  ProductSeoResponse,
  ProductSpecificationListResponse,
  ProductSpecificationPayload,
  ProductSpecificationResponse,
  ProductTagListResponse,
  ProductTagResponse,
  ProductVariantListParams,
  ProductVariantListResponse,
  ProductVariantPayload,
  ProductVariantResponse
} from "@/types/productExtension";

const PRODUCTS_ENDPOINT = "/products";

export function getProductVariants(productId: string, params: ProductVariantListParams) {
  return apiRequest<ProductVariantListResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/variants`,
    params
  });
}

export function createProductVariant(productId: string, payload: ProductVariantPayload) {
  return apiRequest<ProductVariantResponse>({
    method: "POST",
    url: `${PRODUCTS_ENDPOINT}/${productId}/variants`,
    data: payload
  });
}

export function updateProductVariant(variantId: string, payload: Partial<ProductVariantPayload>) {
  return apiRequest<ProductVariantResponse>({
    method: "PUT",
    url: `${PRODUCTS_ENDPOINT}/variants/${variantId}`,
    data: payload
  });
}

export function deleteProductVariant(variantId: string) {
  return apiRequest<ProductVariantResponse>({
    method: "DELETE",
    url: `${PRODUCTS_ENDPOINT}/variants/${variantId}`
  });
}

export function getProductAttributes(productId: string) {
  return apiRequest<ProductAttributeListResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/attributes`
  });
}

export function createProductAttribute(productId: string, payload: ProductAttributePayload) {
  return apiRequest<ProductAttributeResponse>({
    method: "POST",
    url: `${PRODUCTS_ENDPOINT}/${productId}/attributes`,
    data: payload
  });
}

export function updateProductAttribute(attributeId: string, payload: Partial<ProductAttributePayload>) {
  return apiRequest<ProductAttributeResponse>({
    method: "PUT",
    url: `${PRODUCTS_ENDPOINT}/attributes/${attributeId}`,
    data: payload
  });
}

export function deleteProductAttribute(attributeId: string) {
  return apiRequest<ProductAttributeResponse>({
    method: "DELETE",
    url: `${PRODUCTS_ENDPOINT}/attributes/${attributeId}`
  });
}

export function getProductTags(productId: string) {
  return apiRequest<ProductTagListResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/tags`
  });
}

export function createProductTag(productId: string, tagName: string) {
  return apiRequest<ProductTagResponse>({
    method: "POST",
    url: `${PRODUCTS_ENDPOINT}/${productId}/tags`,
    data: { tag_name: tagName }
  });
}

export function deleteProductTag(tagId: string) {
  return apiRequest<ProductTagResponse>({
    method: "DELETE",
    url: `${PRODUCTS_ENDPOINT}/tags/${tagId}`
  });
}

export function getProductSpecifications(productId: string) {
  return apiRequest<ProductSpecificationListResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/specifications`
  });
}

export function createProductSpecification(productId: string, payload: ProductSpecificationPayload) {
  return apiRequest<ProductSpecificationResponse>({
    method: "POST",
    url: `${PRODUCTS_ENDPOINT}/${productId}/specifications`,
    data: payload
  });
}

export function updateProductSpecification(specificationId: string, payload: Partial<ProductSpecificationPayload>) {
  return apiRequest<ProductSpecificationResponse>({
    method: "PUT",
    url: `${PRODUCTS_ENDPOINT}/specifications/${specificationId}`,
    data: payload
  });
}

export function deleteProductSpecification(specificationId: string) {
  return apiRequest<ProductSpecificationResponse>({
    method: "DELETE",
    url: `${PRODUCTS_ENDPOINT}/specifications/${specificationId}`
  });
}

export function getProductSeo(productId: string) {
  return apiRequest<ProductSeoResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/seo`
  });
}

export function upsertProductSeo(productId: string, payload: ProductSeoPayload) {
  return apiRequest<ProductSeoResponse>({
    method: "PUT",
    url: `${PRODUCTS_ENDPOINT}/${productId}/seo`,
    data: payload
  });
}

export function getProductExtensionPreview(productId: string) {
  return apiRequest<ProductExtensionPreviewResponse>({
    method: "GET",
    url: `${PRODUCTS_ENDPOINT}/${productId}/extension-preview`
  });
}
