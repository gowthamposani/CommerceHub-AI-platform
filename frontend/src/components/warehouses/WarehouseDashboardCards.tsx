import { Building2, CheckCircle2, Database, Star, Warehouse, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import type { WarehouseDashboardMetrics } from "@/types/warehouse";
import { formatNumber } from "@/utils/formatters";

const cards = [
  { key: "totalWarehouses", label: "Total Warehouses", icon: Warehouse },
  { key: "activeWarehouses", label: "Active Warehouses", icon: CheckCircle2 },
  { key: "disabledWarehouses", label: "Disabled Warehouses", icon: XCircle },
  { key: "defaultWarehouse", label: "Default Warehouse", icon: Star },
  { key: "totalInventory", label: "Total Inventory", icon: Database },
  { key: "capacityUsed", label: "Capacity Used", icon: Building2 }
] as const;

export function WarehouseDashboardCards({ metrics }: { metrics: WarehouseDashboardMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardContent className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{formatNumber(metrics[card.key])}</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-2 text-brand-gold">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
