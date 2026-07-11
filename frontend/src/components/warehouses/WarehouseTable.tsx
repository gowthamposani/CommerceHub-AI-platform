import { Download, Edit, Eye, RefreshCw, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WarehouseStatusBadge } from "@/components/warehouses/WarehouseStatusBadge";
import { WAREHOUSE_TYPE_LABELS } from "@/constants/warehouse";
import type { Warehouse, WarehouseCapacity } from "@/types/warehouse";
import { formatDate, formatNumber } from "@/utils/formatters";

export function WarehouseTable({
  warehouses,
  capacities,
  loading,
  onSetDefault,
  onDelete,
  onRefresh,
  onExport
}: {
  warehouses: Warehouse[];
  capacities: WarehouseCapacity[];
  loading?: boolean;
  onSetDefault: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onRefresh: () => void;
  onExport: () => void;
}) {
  if (loading) return <TableSkeleton rows={6} />;

  if (warehouses.length === 0) {
    return (
      <EmptyState
        title="No Warehouses Found"
        message="Create a warehouse to start managing seller storage locations."
      />
    );
  }

  const capacityByWarehouse = new Map(capacities.map((capacity) => [capacity.warehouse_id, capacity]));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-gray-100 px-4 py-3">
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button variant="secondary" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {[
                "Warehouse Code",
                "Warehouse Name",
                "City",
                "State",
                "Country",
                "Warehouse Type",
                "Capacity",
                "Used Capacity",
                "Available Capacity",
                "Status",
                "Default",
                "Last Updated",
                "Actions"
              ].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {warehouses.map((warehouse) => {
              const capacity = capacityByWarehouse.get(warehouse.id);
              return (
                <tr key={warehouse.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-950">{warehouse.warehouse_code}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-950">{warehouse.warehouse_name}</p>
                    <p className="text-xs text-gray-500">{warehouse.seller_name ?? "Seller"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{warehouse.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{warehouse.state}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{warehouse.country}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type]}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {capacity?.capacity_units == null ? "Dynamic" : formatNumber(capacity.capacity_units)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(capacity?.utilized_units ?? 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {capacity?.available_capacity_units == null
                      ? "Dynamic"
                      : formatNumber(capacity.available_capacity_units)}
                  </td>
                  <td className="px-4 py-3">
                    <WarehouseStatusBadge status={warehouse.status} />
                  </td>
                  <td className="px-4 py-3">
                    {warehouse.is_default ? <Badge tone="warning">Default</Badge> : <Badge>Standard</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(warehouse.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link to={`/warehouses/${warehouse.id}`}>
                        <Button variant="ghost" size="icon" aria-label="View warehouse">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/warehouses/${warehouse.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="Edit warehouse">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Set default warehouse"
                        disabled={warehouse.is_default}
                        onClick={() => onSetDefault(warehouse)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete warehouse"
                        onClick={() => onDelete(warehouse)}
                      >
                        <Trash2 className="h-4 w-4 text-brand-red" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
