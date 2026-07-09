import type { Option } from "@/types/common";

export const SELLER_BUSINESS_TYPE_OPTIONS: readonly Option[] = [
  { label: "Individual", value: "individual" },
  { label: "Proprietorship", value: "proprietorship" },
  { label: "Partnership", value: "partnership" },
  { label: "Private Limited", value: "private_limited" },
  { label: "LLP", value: "llp" },
  { label: "Other", value: "other" }
];

export const SELLER_STATUS_OPTIONS: readonly Option[] = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" }
];

export const SELLER_SORT_OPTIONS: readonly Option[] = [
  { label: "Created date", value: "created_at" },
  { label: "Business name", value: "business_name" },
  { label: "Email", value: "business_email" },
  { label: "Status", value: "status" },
  { label: "Updated date", value: "updated_at" }
];
