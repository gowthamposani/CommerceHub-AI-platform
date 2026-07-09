import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import type { InventoryRecord } from "@/types/inventory";
import { formatDate, formatNumber } from "@/utils/formatters";

export function InventoryDetailSections({ inventory }: { inventory: InventoryRecord }) {
  const rows = [
    ["Product", inventory.product_name ?? "Not provided"],
    ["SKU", inventory.sku],
    ["Variant", inventory.variant_signature ?? "Default variant"],
    ["Category", inventory.category_name ?? "Not provided"],
    ["Brand", inventory.brand_name ?? "Not provided"],
    ["Seller", inventory.seller_name ?? "Not provided"]
  ];
  const stockRows = [
    ["Available Quantity", formatNumber(inventory.available_quantity)],
    ["Reserved Quantity", formatNumber(inventory.reserved_quantity)],
    ["Damaged Quantity", formatNumber(inventory.damaged_quantity)],
    ["Minimum Stock", formatNumber(inventory.minimum_stock)],
    ["Maximum Stock", inventory.maximum_stock === null ? "Not set" : formatNumber(inventory.maximum_stock)],
    ["Reorder Level", formatNumber(inventory.reorder_level)],
    ["Warehouse Location", "Pending warehouse integration"],
    ["Transfer Ready", inventory.transfer_ready ? "Yes" : "No"],
    ["Last Updated", formatDate(inventory.updated_at)]
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Product Information</h2>
        </CardHeader>
        <CardContent className="grid gap-3">
          {rows.map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-950">Inventory Information</h2>
            <InventoryStatusBadge status={inventory.status} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {stockRows.map(([label, value]) => (
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
