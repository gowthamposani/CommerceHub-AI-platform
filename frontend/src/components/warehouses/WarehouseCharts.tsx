import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { WAREHOUSE_STATUS_LABELS, WAREHOUSE_TYPE_LABELS } from "@/constants/warehouse";
import type { Warehouse, WarehouseCapacity, WarehouseStatus, WarehouseType } from "@/types/warehouse";
import { formatNumber } from "@/utils/formatters";

const statuses: WarehouseStatus[] = ["active", "inactive", "suspended"];
const types: WarehouseType[] = ["fulfillment", "storage", "returns", "cross_dock", "dark_store"];

export function WarehouseCharts({
  warehouses,
  capacities
}: {
  warehouses: Warehouse[];
  capacities: WarehouseCapacity[];
}) {
  const total = Math.max(warehouses.length, 1);
  const capacityValues = capacities.map((item) => Number(item.utilization_percentage ?? 0));
  const averageCapacity = capacityValues.length
    ? capacityValues.reduce((sum, value) => sum + value, 0) / capacityValues.length
    : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Inventory Distribution</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {types.map((type) => {
            const count = warehouses.filter((warehouse) => warehouse.warehouse_type === type).length;
            return (
              <div key={type}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">{WAREHOUSE_TYPE_LABELS[type]}</span>
                  <span className="text-gray-500">{formatNumber(count)}</span>
                </div>
                <Progress value={(count / total) * 100} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Capacity Utilization</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid justify-items-center gap-3 rounded-lg bg-gray-50 p-6 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-yellow-200 bg-white">
              <span className="text-2xl font-bold text-gray-950">{Math.round(averageCapacity)}%</span>
            </div>
            <p className="text-sm font-semibold text-gray-500">Average capacity used</p>
          </div>
          <Progress value={averageCapacity} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Warehouse Performance</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {statuses.map((status) => {
            const count = warehouses.filter((warehouse) => warehouse.status === status).length;
            return (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">{WAREHOUSE_STATUS_LABELS[status]}</span>
                  <span className="text-gray-500">{formatNumber(count)}</span>
                </div>
                <Progress value={(count / total) * 100} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
