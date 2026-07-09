import { useState } from "react";

export function useFilter<T extends Record<string, unknown>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  function updateFilter<K extends keyof T>(key: K, value: T[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  return { filters, updateFilter, resetFilters };
}
