import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import type { WarehouseCapacity } from "@/types/warehouse";
import { formatNumber } from "@/utils/formatters";

export function WarehouseCapacityPanel({ capacity }: { capacity?: WarehouseCapacity | null }) {
  const utilization = Number(capacity?.utilization_percentage ?? 0);
  const warning =
    utilization >= 100 ? "Over Capacity" : utilization >= 85 ? "Near Full" : utilization <= 20 ? "Low Capacity" : null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Warehouse Capacity</h2>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="grid justify-items-center gap-3 rounded-lg bg-gray-50 p-6 text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-yellow-200 bg-white">
            <span className="text-3xl font-bold text-gray-950">{Math.round(utilization)}%</span>
          </div>
          <p className="text-sm font-semibold text-gray-500">Capacity used</p>
        </div>
        <div className="grid content-center gap-4">
          <Progress value={utilization} />
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Storage Used" value={formatNumber(capacity?.utilized_units ?? 0)} />
            <Metric
              label="Remaining Space"
              value={capacity?.available_capacity_units == null ? "Dynamic" : formatNumber(capacity.available_capacity_units)}
            />
            <Metric
              label="Total Capacity"
              value={capacity?.capacity_units == null ? "Dynamic" : formatNumber(capacity.capacity_units)}
            />
          </div>
          {warning ? (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm font-semibold text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              {warning}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4">
      <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-gray-950">{value}</p>
    </div>
  );
}
