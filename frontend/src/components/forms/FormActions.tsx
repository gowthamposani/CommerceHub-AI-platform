import type { ReactNode } from "react";

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  );
}
