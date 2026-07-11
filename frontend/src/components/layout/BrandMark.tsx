import { Sparkles } from "lucide-react";

import { APP_NAME } from "@/constants/app";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold text-gray-950 shadow-soft">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact ? (
        <div>
          <p className="text-sm font-extrabold tracking-normal text-gray-950">{APP_NAME}</p>
          <p className="text-xs font-medium text-gray-500">Marketplace Console</p>
        </div>
      ) : null}
    </div>
  );
}
