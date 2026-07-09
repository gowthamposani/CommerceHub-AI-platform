import type { ApiResponse } from "@/types/common";

export type BrandStatus = "active" | "inactive" | "deleted";

export interface Brand {
  id: string;
  brand_name: string;
  brand_slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  country_of_origin: string | null;
  founded_year: number | null;
  status: BrandStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface BrandListMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface BrandListPayload {
  items: Brand[];
  meta: BrandListMeta;
}

export interface BrandListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: BrandStatus;
  is_active?: boolean;
  country_of_origin?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export type BrandCreatePayload = Pick<
  Brand,
  "brand_name" | "brand_slug" | "description" | "logo_url" | "website" | "country_of_origin" | "founded_year"
>;

export type BrandUpdatePayload = Partial<BrandCreatePayload>;

export type BrandResponse = ApiResponse<Brand>;
export type BrandListResponse = ApiResponse<BrandListPayload>;
