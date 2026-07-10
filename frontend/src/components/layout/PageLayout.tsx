import type { ReactNode } from "react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";

export function PageLayout({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal text-gray-950">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-gray-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
