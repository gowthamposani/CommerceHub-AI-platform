import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700",
        className
      )}
    >
      {children}
    </span>
  );
}
