import {
  Clock3,
  DollarSign,
  Package,
  ShoppingCart,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { memo, useMemo } from "react";

import type { DashboardSummary } from "../../types/admin";

type DashboardCardsProps = {
  summary: DashboardSummary;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export const DashboardCards = memo(function DashboardCards({ summary }: DashboardCardsProps) {
  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        value: formatNumber(summary.totalUsers),
        helper: "All platform accounts",
        icon: Users,
      },
      {
        label: "Total Customers",
        value: formatNumber(summary.totalCustomers),
        helper: "Buyer ecosystem",
        icon: UserCheck,
      },
      {
        label: "Total Sellers",
        value: formatNumber(summary.totalSellers),
        helper: "Marketplace partners",
        icon: Store,
      },
      {
        label: "Total Products",
        value: formatNumber(summary.totalProducts),
        helper: "Catalog inventory",
        icon: Package,
      },
      {
        label: "Orders",
        value: formatNumber(summary.totalOrders),
        helper: "Commerce transactions",
        icon: ShoppingCart,
      },
      {
        label: "Revenue",
        value: formatCurrency(summary.revenue),
        helper: "Recognized revenue",
        icon: DollarSign,
      },
      {
        label: "Pending Requests",
        value: formatNumber(summary.pendingSellerRequests),
        helper: "Admin review queue",
        icon: Clock3,
      },
    ],
    [summary],
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="group min-h-40 rounded-admin border border-admin-border bg-white p-6 shadow-admin transition duration-200 hover:-translate-y-0.5 hover:shadow-admin dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-admin-muted dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-admin-ink dark:text-white">
                  {card.value}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-admin bg-admin-cream text-admin-gold transition group-hover:bg-admin-gold group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-5 text-sm text-admin-muted dark:text-slate-400">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
});
