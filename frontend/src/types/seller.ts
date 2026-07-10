import type { ApiResponse } from "@/types/common";

export type SellerStatus = "pending" | "active" | "inactive" | "suspended" | "deleted";

export type SellerBusinessType = "individual" | "proprietorship" | "partnership" | "private_limited" | "llp" | "other";

export interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  legal_business_name: string | null;
  business_type: SellerBusinessType;
  business_email: string;
  business_phone: string;
  gst_number: string;
  pan_number: string;
  tax_identification_number: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string | null;
  default_currency: string;
  notifications_enabled: boolean;
  order_auto_accept_enabled: boolean;
  is_active: boolean;
  is_verified: boolean;
  status: SellerStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface SellerListMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SellerListPayload {
  items: Seller[];
  meta: SellerListMeta;
}

export interface SellerListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: SellerStatus;
  business_type?: SellerBusinessType;
  is_active?: boolean;
  is_verified?: boolean;
  city?: string;
  state?: string;
  country?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export type SellerCreatePayload = Omit<
  Seller,
  "id" | "is_active" | "is_verified" | "status" | "created_at" | "updated_at" | "deleted_at" | "is_deleted"
>;

export type SellerUpdatePayload = Partial<Omit<SellerCreatePayload, "user_id">>;

export type SellerResponse = ApiResponse<Seller>;
export type SellerListResponse = ApiResponse<SellerListPayload>;
