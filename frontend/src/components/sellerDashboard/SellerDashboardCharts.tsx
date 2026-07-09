import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatNumber } from "@/utils/formatters";
import type { DashboardChartPoint, DashboardRankedItem, DashboardTrendPoint } from "@/types/sellerDashboard";

function numericValue(value: string | number): number {
  return Number(value) || 0;
}

function maxValue(items: Array<{ value: string | number }>): number {
  return Math.max(1, ...items.map((item) => numericValue(item.value)));
}

function TrendBars({ items }: { items: DashboardTrendPoint[] }) {
  const max = maxValue(items);
  if (items.length === 0) {
    return <p className="py-12 text-center text-sm font-semibold text-gray-500">No trend data available.</p>;
  }
  return (
    <div className="flex h-40 items-end gap-2" aria-label="Trend chart">
      {items.map((item) => {
        const value = numericValue(item.value);
        return (
          <div key={`${item.period}-${item.value}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-brand-gold transition hover:bg-yellow-400"
              style={{ height: `${Math.max(8, (value / max) * 140)}px` }}
              title={`${item.period}: ${formatNumber(value)}`}
            />
            <span className="w-full truncate text-center text-xs font-semibold text-gray-500">{item.period}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ items }: { items: Array<DashboardChartPoint | DashboardRankedItem> }) {
  const max = maxValue(items);
  if (items.length === 0) {
    return <p className="py-12 text-center text-sm font-semibold text-gray-500">No chart data available.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = numericValue(item.value);
        return (
          <div key={`${item.label}-${item.value}`} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-gray-700">{item.label}</span>
              <span className="font-bold text-gray-950">{formatNumber(value)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-brand-blue"
                style={{ width: `${Math.max(4, (value / max) * 100)}%` }}
                title={`${item.label}: ${formatNumber(value)}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SellerDashboardCharts({
  salesTrend,
  inventoryTrend,
  warehouseCapacity,
  topProducts,
  topCategories
}: {
  salesTrend: DashboardTrendPoint[];
  inventoryTrend: DashboardTrendPoint[];
  warehouseCapacity: DashboardChartPoint[];
  topProducts: DashboardRankedItem[];
  topCategories: DashboardChartPoint[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Sales Trend</h2>
        </CardHeader>
        <CardContent>
          <TrendBars items={salesTrend} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Inventory Trend</h2>
        </CardHeader>
        <CardContent>
          <TrendBars items={inventoryTrend} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Warehouse Capacity</h2>
        </CardHeader>
        <CardContent>
          <HorizontalBars items={warehouseCapacity} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Top Products</h2>
        </CardHeader>
        <CardContent>
          <HorizontalBars items={topProducts.length > 0 ? topProducts : topCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
