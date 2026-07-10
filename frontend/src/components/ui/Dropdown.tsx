import type { ReactNode } from "react";

export function Dropdown({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <div className="group relative">
      {trigger}
      <div className="invisible absolute right-0 z-30 mt-2 min-w-48 rounded-lg border border-gray-200 bg-white p-2 opacity-0 shadow-panel transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {children}
      </div>
    </div>
  );
}
