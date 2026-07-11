import { MapPin, Phone, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WarehouseStatusBadge } from "@/components/warehouses/WarehouseStatusBadge";
import { WAREHOUSE_TYPE_LABELS } from "@/constants/warehouse";
import type { Warehouse, WarehouseCapacity, WarehouseInventorySummary } from "@/types/warehouse";
import { formatNumber } from "@/utils/formatters";

export function WarehouseDetailSections({
  warehouse,
  capacity,
  summary
}: {
  warehouse: Warehouse;
  capacity?: WarehouseCapacity | null;
  summary?: WarehouseInventorySummary | null;
}) {
  const address = [
    warehouse.address_line_1,
    warehouse.address_line_2,
    warehouse.city,
    warehouse.state,
    warehouse.country,
    warehouse.postal_code
  ]
    .filter(Boolean)
    .join(", ");

  const infoRows = [
    ["Code", warehouse.warehouse_code],
    ["Name", warehouse.warehouse_name],
    ["Type", WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type]],
    ["Default", warehouse.is_default ? "Yes" : "No"],
    ["Seller", warehouse.seller_name ?? warehouse.seller_id]
  ];
  const statRows = [
    ["Products Stored", formatNumber(summary?.unique_products ?? 0)],
    ["Inventory Records", formatNumber(summary?.inventory_records ?? 0)],
    ["Reserved Stock", formatNumber(summary?.total_reserved_quantity ?? 0)],
    ["Low Stock", formatNumber(summary?.low_stock_records ?? 0)],
    ["Out Of Stock", formatNumber(summary?.out_of_stock_records ?? 0)],
    ["Capacity Used", formatNumber(capacity?.utilized_units ?? 0)],
    [
      "Capacity Remaining",
      capacity?.available_capacity_units == null ? "Dynamic" : formatNumber(capacity.available_capacity_units)
    ]
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-950">Warehouse Information</h2>
            <WarehouseStatusBadge status={warehouse.status} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {infoRows.map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-950">
              <MapPin className="h-4 w-4 text-brand-gold" />
              Address
            </div>
            <p className="text-sm text-gray-600">{address}</p>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              GPS: {warehouse.latitude ?? "Not set"}, {warehouse.longitude ?? "Not set"}
            </p>
          </div>
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand-gold" />
              <span className="text-sm font-semibold text-gray-700">{warehouse.contact_person}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-gold" />
              <span className="text-sm font-semibold text-gray-700">{warehouse.phone_number}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Statistics & Inventory Summary</h2>
        </CardHeader>
        <CardContent className="grid gap-3">
          {statRows.map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <span className="text-right text-sm font-bold text-gray-950">{value}</span>
    </div>
  );
}
