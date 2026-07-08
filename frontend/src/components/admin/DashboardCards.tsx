import { Boxes, DollarSign, ShoppingCart, Store, UserCheck, Users } from "lucide-react";

import type { DashboardSummary } from "../../services/admin.service";

type DashboardCardsProps = {
  summary: DashboardSummary;
};

export function DashboardCards({ summary }: DashboardCardsProps) {
  const cards = [
    {
      label: "Revenue",
      value: summary.revenue,
      helper: "+12.8% vs last month",
      icon: DollarSign,
    },
    {
      label: "Total Users",
      value: summary.totalUsers.toLocaleString(),
      helper: `${summary.activeUsers.toLocaleString()} active`,
      icon: Users,
    },
    {
      label: "Sellers",
      value: summary.totalSellers.toLocaleString(),
      helper: `${summary.pendingSellerRequests} pending reviews`,
      icon: Store,
    },
    {
      label: "Customers",
      value: summary.totalCustomers.toLocaleString(),
      helper: "High retention segment",
      icon: UserCheck,
    },
    {
      label: "Products",
      value: summary.totalProducts.toLocaleString(),
      helper: "Catalog health stable",
      icon: Boxes,
    },
    {
      label: "Orders",
      value: summary.totalOrders.toLocaleString(),
      helper: "+7.4% weekly growth",
      icon: ShoppingCart,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Dashboard cards">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                {card.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
