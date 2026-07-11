import type { ApiResponse } from "@/types/common";

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
  is_primary: boolean;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductImageListPayload {
  items: ProductImage[];
}

export type ProductImageResponse = ApiResponse<ProductImage>;
export type ProductImageListResponse = ApiResponse<ProductImageListPayload>;
