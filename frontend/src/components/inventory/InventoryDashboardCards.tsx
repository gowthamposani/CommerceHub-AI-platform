import { AlertTriangle, Boxes, IndianRupee, PackageCheck, PackageX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import type { InventoryDashboardMetrics } from "@/types/inventory";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const cards = [
  { key: "totalProducts", label: "Total Products", icon: Boxes },
  { key: "totalStockUnits", label: "Total Stock Units", icon: PackageCheck },
  { key: "lowStockProducts", label: "Low Stock Products", icon: AlertTriangle },
  { key: "outOfStockProducts", label: "Out Of Stock Products", icon: PackageX },
  { key: "inventoryValue", label: "Inventory Value", icon: IndianRupee }
] as const;

export function InventoryDashboardCards({ metrics }: { metrics: InventoryDashboardMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        return (
          <Card key={card.key}>
            <CardContent className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {card.key === "inventoryValue"
                    ? value === null
                      ? "Pending"
                      : formatCurrency(Number(value))
                    : formatNumber(Number(value))}
                </p>
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
