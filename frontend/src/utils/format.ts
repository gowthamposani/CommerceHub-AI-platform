import { appConfig } from "../config";
import type { OrderStatus } from "../types/domain";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: appConfig.currency
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return dateFormatter.format(date);
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function truncate(value: string | null | undefined, length = 72): string {
  if (!value) {
    return "";
  }

  return value.length > length ? `${value.slice(0, length).trimEnd()}...` : value;
}

export function shortId(value: string | null | undefined, length = 8): string {
  if (!value) {
    return "N/A";
  }

  return value.length > length ? value.slice(0, length) : value;
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName ?? "").trim().charAt(0);
  const last = (lastName ?? "").trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "C";
}

export function formatOrderStatus(status: OrderStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
