import { Eye, PackageMinus, PackagePlus, Settings, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Button } from "@/components/ui/Button";
import type { InventoryRecord } from "@/types/inventory";
import { formatDate, formatNumber } from "@/utils/formatters";

export function InventoryTable({
  inventory,
  loading,
  onStockIn,
  onStockOut,
  onSettings,
  onDelete,
  emptyAction
}: {
  inventory: InventoryRecord[];
  loading?: boolean;
  onStockIn: (inventory: InventoryRecord) => void;
  onStockOut: (inventory: InventoryRecord) => void;
  onSettings: (inventory: InventoryRecord) => void;
  onDelete: (inventory: InventoryRecord) => void;
  emptyAction?: ReactNode;
}) {
  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (inventory.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No Inventory Records"
          message="Create inventory for a product variant to begin stock tracking."
        />
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
              {[
                "Product Image",
                "Product Name",
                "SKU",
                "Category",
                "Current Stock",
                "Reserved Stock",
                "Available Stock",
                "Status",
                "Last Updated",
                "Actions"
              ].map((header) => (
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
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name ?? item.sku}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400">
                      IMG
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-950">{item.product_name ?? "Product"}</p>
                  <p className="text-xs text-gray-500">{item.variant_signature ?? "Default variant"}</p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{item.sku}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.category_name ?? "Not provided"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-950">
                  {formatNumber(item.available_quantity + item.reserved_quantity)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.reserved_quantity)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.available_quantity)}</td>
                <td className="px-4 py-3">
                  <InventoryStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/inventory/${item.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View inventory">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" aria-label="Add stock" onClick={() => onStockIn(item)}>
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Remove stock" onClick={() => onStockOut(item)}>
                      <PackageMinus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Inventory settings"
                      onClick={() => onSettings(item)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete inventory" onClick={() => onDelete(item)}>
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
