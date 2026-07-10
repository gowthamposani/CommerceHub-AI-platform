import type { Product } from "../types/domain";

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickString = (record: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
};

const pickOptionalString = (record: Record<string, unknown>, keys: string[]): string | null => {
  const value = pickString(record, keys);
  return value ?? null;
};

export function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = pickString(record, ["id"]);
  const title = pickString(record, ["title", "name", "product_title"]);

  if (!id || !title) {
    return null;
  }

  return {
    id,
    seller_id: pickOptionalString(record, ["seller_id"]),
    category_id: pickOptionalString(record, ["category_id"]),
    title,
    description: pickOptionalString(record, ["description", "short_description"]),
    price: toNumber(record.price ?? record.unit_price ?? record.cost, 0),
    stock: toNumber(record.stock ?? record.inventory_count ?? record.available_quantity, 0),
    image: pickOptionalString(record, ["image", "image_url", "thumbnail", "thumbnail_url"]),
    status: pickOptionalString(record, ["status"]),
    created_at: pickOptionalString(record, ["created_at"]) ?? undefined,
    updated_at: pickOptionalString(record, ["updated_at"]) ?? undefined
  };
}

export function normalizeProductList(raw: unknown): Product[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeProduct).filter((product): product is Product => product !== null);
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of ["items", "results", "products", "data"]) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        return nested.map(normalizeProduct).filter((product): product is Product => product !== null);
      }
    }
  }

  return [];
}
