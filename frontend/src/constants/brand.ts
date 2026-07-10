import type { Option } from "@/types/common";

export const BRAND_STATUS_OPTIONS: readonly Option[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Deleted", value: "deleted" }
] as const;

export const BRAND_SORT_OPTIONS: readonly Option[] = [
  { label: "Brand Name", value: "brand_name" },
  { label: "Created Date", value: "created_at" },
  { label: "Country", value: "country_of_origin" },
  { label: "Founded Year", value: "founded_year" }
] as const;

export const BRAND_LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const BRAND_LOGO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;
