import type { ReactNode } from "react";

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {error ? <span className="text-sm text-brand-red">{error}</span> : null}
    </label>
  );
}
