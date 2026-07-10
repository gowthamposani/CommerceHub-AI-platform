import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { INVENTORY_STATUS_LABELS } from "@/constants/inventory";
import type { InventoryRecord, InventoryStatus } from "@/types/inventory";

const statuses: InventoryStatus[] = ["in_stock", "low_stock", "out_of_stock", "inactive"];

export function InventoryCharts({ inventory }: { inventory: InventoryRecord[] }) {
  const total = Math.max(inventory.length, 1);
  const statusCounts = statuses.map((status) => ({
    status,
    count: inventory.filter((item) => item.status === status).length
  }));
  const trendItems = inventory.slice(0, 8);
  const maxStock = Math.max(...trendItems.map((item) => item.available_quantity + item.reserved_quantity), 1);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Stock Movement Trend</h2>
        </CardHeader>
        <CardContent>
          {trendItems.length === 0 ? (
            <p className="text-sm text-gray-500">No inventory movement available.</p>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {trendItems.map((item) => (
                <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-brand-gold"
                    style={{
                      height: `${Math.max(8, ((item.available_quantity + item.reserved_quantity) / maxStock) * 160)}px`
                    }}
                    aria-label={`${item.sku} stock ${item.available_quantity + item.reserved_quantity}`}
                  />
                  <span className="max-w-full truncate text-xs font-semibold text-gray-500">{item.sku}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Inventory Status Distribution</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusCounts.map((item) => (
            <div key={item.status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">{INVENTORY_STATUS_LABELS[item.status]}</span>
                <span className="text-gray-500">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-brand-gold"
                  style={{ width: `${(item.count / total) * 100}%` }}
                  aria-label={`${INVENTORY_STATUS_LABELS[item.status]} ${item.count}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
