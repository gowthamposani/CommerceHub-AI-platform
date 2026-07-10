import type { ApiResponse } from "@/types/common";

export type ProductStatus = "draft" | "published" | "unpublished" | "archived" | "deleted";
export type ProductVisibility = "public" | "private" | "hidden";

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  brand_id: string;
  product_name: string;
  product_slug: string;
  short_description: string | null;
  long_description: string | null;
  sku: string;
  barcode: string | null;
  price: string | number;
  discount_price: string | number | null;
  cost_price: string | number | null;
  currency: string;
  tax_percentage: string | number;
  weight: string | number | null;
  length: string | number | null;
  width: string | number | null;
  height: string | number | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  is_featured: boolean;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  seller_name?: string | null;
  category_name?: string | null;
  brand_name?: string | null;
}

export interface ProductListMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductListPayload {
  items: Product[];
  meta: ProductListMeta;
}

export interface ProductListParams {
  page: number;
  page_size: number;
  search?: string;
  seller_id?: string;
  category_id?: string;
  brand_id?: string;
  status?: ProductStatus;
  min_price?: string;
  max_price?: string;
  is_featured?: boolean;
  is_published?: boolean;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export type ProductCreatePayload = Pick<
  Product,
  | "seller_id"
  | "category_id"
  | "brand_id"
  | "product_name"
  | "product_slug"
  | "short_description"
  | "long_description"
  | "sku"
  | "barcode"
  | "price"
  | "discount_price"
  | "cost_price"
  | "currency"
  | "tax_percentage"
  | "weight"
  | "length"
  | "width"
  | "height"
  | "visibility"
  | "is_featured"
>;

export type ProductUpdatePayload = Partial<ProductCreatePayload>;
export interface PublishProductPayload {
  visibility: ProductVisibility;
}

export type ProductResponse = ApiResponse<Product>;
export type ProductListResponse = ApiResponse<ProductListPayload>;
