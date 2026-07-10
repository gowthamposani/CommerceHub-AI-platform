import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Button } from "@/components/ui/Button";
import type { InventoryRecord } from "@/types/inventory";
import { formatNumber } from "@/utils/formatters";

export function WarehouseInventoryTable({
  inventory,
  loading
}: {
  inventory: InventoryRecord[];
  loading?: boolean;
}) {
  if (loading) return <TableSkeleton rows={5} />;
  if (inventory.length === 0) {
    return <EmptyState title="No Warehouse Inventory" message="No inventory records are assigned to this warehouse." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Product",
                "SKU",
                "Current Quantity",
                "Reserved Quantity",
                "Available Quantity",
                "Minimum Stock",
                "Maximum Stock",
                "Reorder Level",
                "Status",
                "Actions"
              ].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-950">{item.product_name ?? "Product"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.sku}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatNumber(item.available_quantity + item.reserved_quantity)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.reserved_quantity)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.available_quantity)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.minimum_stock)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {item.maximum_stock == null ? "Not set" : formatNumber(item.maximum_stock)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.reorder_level)}</td>
                <td className="px-4 py-3">
                  <InventoryStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <Link to={`/inventory/${item.id}`}>
                    <Button variant="ghost">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
