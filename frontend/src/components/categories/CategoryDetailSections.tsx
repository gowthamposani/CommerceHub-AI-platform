import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Category } from "@/types/category";
import { formatDate } from "@/utils/formatters";

function DetailItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value === null || value === "" || value === undefined ? "Not provided" : String(value)}
      </p>
    </div>
  );
}

function statusTone(status: Category["status"]) {
  if (status === "active") return "success";
  if (status === "inactive") return "warning";
  return "neutral";
}

export function CategoryDetailSections({ category, parentName }: { category: Category; parentName?: string | null }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-950">{category.category_name}</h2>
            <p className="text-sm text-gray-600">{category.category_slug}</p>
          </div>
          <Badge tone={statusTone(category.status)}>{category.status}</Badge>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.category_name}
                className="max-h-40 rounded-md object-contain"
              />
            ) : (
              <div className="grid justify-items-center gap-2 text-center text-sm text-gray-500">
                <ImageOff className="h-7 w-7" />
                No image
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Parent Category" value={parentName ?? "Root"} />
            <DetailItem label="Display Order" value={category.display_order} />
            <DetailItem label="Active" value={category.is_active ? "Yes" : "No"} />
            <DetailItem label="Created" value={formatDate(category.created_at)} />
            <DetailItem label="Updated" value={formatDate(category.updated_at)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Description</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-gray-700">{category.description || "No description provided."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
