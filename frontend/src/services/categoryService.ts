import { apiRequest } from "@/api/client";
import type {
  CategoryCreatePayload,
  CategoryListParams,
  CategoryListResponse,
  CategoryResponse,
  CategoryTreeResponse,
  CategoryUpdatePayload
} from "@/types/category";

const CATEGORIES_ENDPOINT = "/categories";

export function getCategories(params: CategoryListParams) {
  return apiRequest<CategoryListResponse>({
    method: "GET",
    url: CATEGORIES_ENDPOINT,
    params
  });
}

export function getCategoryTree() {
  return apiRequest<CategoryTreeResponse>({
    method: "GET",
    url: `${CATEGORIES_ENDPOINT}/tree`
  });
}

export function getCategory(categoryId: string) {
  return apiRequest<CategoryResponse>({
    method: "GET",
    url: `${CATEGORIES_ENDPOINT}/${categoryId}`
  });
}

export function createCategory(payload: CategoryCreatePayload) {
  return apiRequest<CategoryResponse>({
    method: "POST",
    url: CATEGORIES_ENDPOINT,
    data: payload
  });
}

export function updateCategory(categoryId: string, payload: CategoryUpdatePayload) {
  return apiRequest<CategoryResponse>({
    method: "PUT",
    url: `${CATEGORIES_ENDPOINT}/${categoryId}`,
    data: payload
  });
}

export function activateCategory(categoryId: string) {
  return apiRequest<CategoryResponse>({
    method: "PATCH",
    url: `${CATEGORIES_ENDPOINT}/${categoryId}/activate`
  });
}

export function deactivateCategory(categoryId: string) {
  return apiRequest<CategoryResponse>({
    method: "PATCH",
    url: `${CATEGORIES_ENDPOINT}/${categoryId}/deactivate`
  });
}

export function deleteCategory(categoryId: string) {
  return apiRequest<CategoryResponse>({
    method: "DELETE",
    url: `${CATEGORIES_ENDPOINT}/${categoryId}`
  });
}
