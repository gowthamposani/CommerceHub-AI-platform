import type { Option } from "@/types/common";

export const CATEGORY_STATUS_OPTIONS: readonly Option[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Deleted", value: "deleted" }
] as const;

export const CATEGORY_SORT_OPTIONS: readonly Option[] = [
  { label: "Display Order", value: "display_order" },
  { label: "Category Name", value: "category_name" },
  { label: "Slug", value: "category_slug" },
  { label: "Status", value: "status" },
  { label: "Created Date", value: "created_at" },
  { label: "Updated Date", value: "updated_at" }
] as const;
