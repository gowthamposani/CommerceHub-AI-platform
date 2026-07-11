import type { ApiResponse } from "@/types/common";

export type CategoryStatus = "active" | "inactive" | "deleted";

export interface Category {
  id: string;
  parent_category_id: string | null;
  category_name: string;
  category_slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryListMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CategoryListPayload {
  items: Category[];
  meta: CategoryListMeta;
}

export interface CategoryListParams {
  page: number;
  page_size: number;
  search?: string;
  parent_category_id?: string;
  status?: CategoryStatus;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export type CategoryCreatePayload = Pick<
  Category,
  "parent_category_id" | "category_name" | "category_slug" | "description" | "image_url" | "display_order"
>;

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

export type CategoryResponse = ApiResponse<Category>;
export type CategoryListResponse = ApiResponse<CategoryListPayload>;
export type CategoryTreeResponse = ApiResponse<CategoryTreeNode[]>;
