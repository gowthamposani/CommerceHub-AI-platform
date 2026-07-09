import { apiRequest } from "@/api/client";
import type { ProductImageListResponse, ProductImageResponse } from "@/types/productImage";

const PRODUCT_IMAGES_ENDPOINT = "/products";

function buildImageFormData({
  file,
  altText,
  displayOrder,
  isPrimary
}: {
  file?: File;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (altText !== undefined) formData.append("alt_text", altText);
  if (displayOrder !== undefined) formData.append("display_order", String(displayOrder));
  if (isPrimary !== undefined) formData.append("is_primary", String(isPrimary));
  return formData;
}

export function getProductImages(productId: string) {
  return apiRequest<ProductImageListResponse>({
    method: "GET",
    url: `${PRODUCT_IMAGES_ENDPOINT}/${productId}/images`
  });
}

export function uploadProductImage(productId: string, payload: { file: File; altText?: string; isPrimary?: boolean }) {
  return apiRequest<ProductImageResponse>({
    method: "POST",
    url: `${PRODUCT_IMAGES_ENDPOINT}/${productId}/images`,
    data: buildImageFormData({
      file: payload.file,
      altText: payload.altText,
      isPrimary: payload.isPrimary
    }),
    headers: { "Content-Type": "multipart/form-data" }
  });
}

export function updateProductImage(imageId: string, payload: { file?: File; altText?: string; displayOrder?: number }) {
  return apiRequest<ProductImageResponse>({
    method: "PUT",
    url: `${PRODUCT_IMAGES_ENDPOINT}/images/${imageId}`,
    data: buildImageFormData({
      file: payload.file,
      altText: payload.altText,
      displayOrder: payload.displayOrder
    }),
    headers: { "Content-Type": "multipart/form-data" }
  });
}

export function markPrimaryProductImage(imageId: string) {
  return apiRequest<ProductImageResponse>({
    method: "PATCH",
    url: `${PRODUCT_IMAGES_ENDPOINT}/images/${imageId}/primary`
  });
}

export function deleteProductImage(imageId: string) {
  return apiRequest<ProductImageResponse>({
    method: "DELETE",
    url: `${PRODUCT_IMAGES_ENDPOINT}/images/${imageId}`
  });
}
