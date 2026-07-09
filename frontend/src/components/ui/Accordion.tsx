import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-lg border border-gray-200 bg-white p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
        {title}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </summary>
      <div className="mt-3 text-sm text-gray-600">{children}</div>
    </details>
  );
}
