import type { ReactNode } from "react";

export function Popover({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <div className="group relative inline-flex">
      {trigger}
      <div className="invisible absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 opacity-0 shadow-panel transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {children}
      </div>
    </div>
  );
}
