import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function Tabs({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function Tab({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-semibold transition",
        active ? "bg-brand-gold text-gray-950" : "bg-white text-gray-600 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}
