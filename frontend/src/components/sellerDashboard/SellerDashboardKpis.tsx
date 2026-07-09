import {
  BadgeCheck,
  Boxes,
  ClipboardList,
  IndianRupee,
  PackageSearch,
  Store,
  Users,
  Warehouse
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import type { SellerDashboardOverview } from "@/types/sellerDashboard";

function toNumber(value: number | string): number {
  return Number(value) || 0;
}

export function SellerDashboardKpis({ overview }: { overview: SellerDashboardOverview }) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(toNumber(overview.revenue.total_revenue)),
      meta: "Revenue module pending",
      icon: IndianRupee
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(toNumber(overview.revenue.today_revenue)),
      meta: `${toNumber(overview.revenue.revenue_growth_percentage)}% growth`,
      icon: IndianRupee
    },
    {
      label: "Total Orders",
      value: formatNumber(overview.orders.total_orders),
      meta: `${formatNumber(overview.orders.pending_orders)} pending`,
      icon: ClipboardList
    },
    {
      label: "Products",
      value: formatNumber(overview.products.total_products),
      meta: `${formatNumber(overview.products.active_products)} active`,
      icon: PackageSearch
    },
    {
      label: "Inventory",
      value: formatNumber(overview.inventory.total_inventory),
      meta: `${formatNumber(overview.inventory.available_inventory)} available`,
      icon: Boxes
    },
    {
      label: "Warehouses",
      value: formatNumber(overview.warehouses.total_warehouses),
      meta: `${formatNumber(overview.warehouses.active_warehouses)} active`,
      icon: Warehouse
    },
    {
      label: "Customers",
      value: formatNumber(overview.customers.total_customers),
      meta: `${formatNumber(overview.customers.returning_customers)} returning`,
      icon: Users
    },
    {
      label: "Store Health",
      value: `${overview.seller.store_health_score}%`,
      meta: overview.seller.account_verification_status ? "Verified account" : "Verification pending",
      icon: BadgeCheck
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="md:col-span-2 xl:col-span-4">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold text-gray-950">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">{overview.seller.store_name}</h2>
              <p className="text-sm text-gray-600">
                {overview.seller.seller_status} · Rating {Number(overview.seller.store_rating).toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600">
            Last updated {new Date(overview.date_window.end_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">{card.value}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">{card.meta}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
