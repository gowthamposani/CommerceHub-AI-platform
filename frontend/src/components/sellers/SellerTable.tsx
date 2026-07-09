import { Eye, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import type { Seller } from "@/types/seller";
import { formatDate } from "@/utils/formatters";

export function SellerTable({
  sellers,
  loading,
  onActivate,
  onDeactivate,
  onDelete,
  emptyAction
}: {
  sellers: Seller[];
  loading?: boolean;
  onActivate: (seller: Seller) => void;
  onDeactivate: (seller: Seller) => void;
  onDelete: (seller: Seller) => void;
  emptyAction?: ReactNode;
}) {
  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (sellers.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState title="No sellers found" message="Create a seller profile to start managing marketplace sellers." />
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
              {["Business Name", "Email", "Phone", "GST", "Status", "Created Date", "Actions"].map((header) => (
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
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-950">{seller.business_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{seller.business_email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{seller.business_phone}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{seller.gst_number}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={seller.status === "active" ? "success" : seller.status === "inactive" ? "warning" : "neutral"}
                  >
                    {seller.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(seller.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/sellers/${seller.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View seller">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/sellers/${seller.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit seller">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {seller.is_active ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeactivate(seller)}
                        aria-label="Deactivate seller"
                      >
                        <PowerOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onActivate(seller)}
                        aria-label="Activate seller"
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDelete(seller)} aria-label="Delete seller">
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
