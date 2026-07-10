import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/Card";

export function FilterPanel({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </div>
        <div className="flex flex-1 flex-wrap gap-3">{children}</div>
      </CardContent>
    </Card>
  );
}
