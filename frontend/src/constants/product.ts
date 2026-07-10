import type { Option } from "@/types/common";

export const PRODUCT_STATUS_OPTIONS: readonly Option[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Archived", value: "archived" }
];

export const PRODUCT_VISIBILITY_OPTIONS: readonly Option[] = [
  { label: "Private", value: "private" },
  { label: "Public", value: "public" },
  { label: "Hidden", value: "hidden" }
];

export const PRODUCT_SORT_OPTIONS: readonly Option[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price", value: "price" },
  { label: "Name", value: "name" }
];

export const PRODUCT_CURRENCY_OPTIONS: readonly Option[] = [
  { label: "INR", value: "INR" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" }
];
