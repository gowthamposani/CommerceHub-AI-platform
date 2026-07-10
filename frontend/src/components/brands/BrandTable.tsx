import { Eye, ImageOff, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Brand } from "@/types/brand";
import { formatDate } from "@/utils/formatters";

function statusTone(status: Brand["status"]) {
  if (status === "active") return "success";
  if (status === "inactive") return "warning";
  return "neutral";
}

export function BrandTable({
  brands,
  loading,
  onActivate,
  onDeactivate,
  onDelete,
  emptyAction
}: {
  brands: Brand[];
  loading?: boolean;
  onActivate: (brand: Brand) => void;
  onDeactivate: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  emptyAction?: ReactNode;
}) {
  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (brands.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState title="No Brands Available" message="Create a brand to start managing product brand identity." />
        {emptyAction ? <div className="flex justify-center">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {["Logo", "Brand Name", "Website", "Country", "Status", "Created Date", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={`${brand.brand_name} logo`}
                        className="max-h-8 max-w-8 object-contain"
                      />
                    ) : (
                      <ImageOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-950">{brand.brand_name}</p>
                  <p className="text-xs text-gray-500">{brand.brand_slug}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{brand.website ?? "Not provided"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{brand.country_of_origin ?? "Not provided"}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(brand.status)}>{brand.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(brand.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/brands/${brand.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View brand">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/brands/${brand.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit brand">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {brand.is_active ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeactivate(brand)}
                        aria-label="Deactivate brand"
                      >
                        <PowerOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => onActivate(brand)} aria-label="Activate brand">
                        <Power className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDelete(brand)} aria-label="Delete brand">
                      <Trash2 className="h-4 w-4 text-brand-red" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
