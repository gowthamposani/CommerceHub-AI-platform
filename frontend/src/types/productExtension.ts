import type { ApiResponse } from "@/types/common";

export type ProductVariantStatus = "draft" | "active" | "inactive" | "archived";

export interface AttributeSelection {
  attribute_id: string;
  value: string;
}

export interface ProductAttributeValue {
  id: string;
  product_id: string;
  attribute_id: string;
  variant_id: string | null;
  value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  price: string | number;
  discount_price: string | number | null;
  cost_price: string | number | null;
  weight: string | number | null;
  length: string | number | null;
  width: string | number | null;
  height: string | number | null;
  status: ProductVariantStatus;
  is_active: boolean;
  variant_signature: string;
  attribute_values: ProductAttributeValue[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductVariantPayload {
  sku: string;
  barcode?: string | null;
  price: string;
  discount_price?: string | null;
  cost_price?: string | null;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  status: ProductVariantStatus;
  is_active: boolean;
  attributes: AttributeSelection[];
}

export interface ProductVariantListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: ProductVariantStatus;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface ProductVariantListPayload {
  items: ProductVariant[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_name: string;
  display_order: number;
  is_variant_defining: boolean;
  values: ProductAttributeValue[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductAttributePayload {
  attribute_name: string;
  values: string[];
  display_order: number;
  is_variant_defining: boolean;
}

export interface ProductTag {
  id: string;
  product_id: string;
  tag_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  group_name: string | null;
  specification_name: string;
  specification_value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductSpecificationPayload {
  group_name?: string | null;
  specification_name: string;
  specification_value: string;
  display_order: number;
}

export interface ProductSeoMetadata {
  id: string;
  product_id: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  meta_robots: string;
  canonical_url: string | null;
  friendly_url: string | null;
  open_graph_title: string | null;
  open_graph_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface ProductSeoPayload {
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  meta_robots: string;
  canonical_url?: string | null;
  friendly_url?: string | null;
  open_graph_title?: string | null;
  open_graph_description?: string | null;
}

export interface ProductExtensionPreview {
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: ProductTag[];
  specifications: ProductSpecification[];
  seo: ProductSeoMetadata | null;
}

export type ProductVariantResponse = ApiResponse<ProductVariant>;
export type ProductVariantListResponse = ApiResponse<ProductVariantListPayload>;
export type ProductAttributeResponse = ApiResponse<ProductAttribute>;
export type ProductAttributeListResponse = ApiResponse<{ items: ProductAttribute[] }>;
export type ProductTagResponse = ApiResponse<ProductTag>;
export type ProductTagListResponse = ApiResponse<{ items: ProductTag[] }>;
export type ProductSpecificationResponse = ApiResponse<ProductSpecification>;
export type ProductSpecificationListResponse = ApiResponse<{ items: ProductSpecification[] }>;
export type ProductSeoResponse = ApiResponse<ProductSeoMetadata | null>;
export type ProductExtensionPreviewResponse = ApiResponse<ProductExtensionPreview>;
