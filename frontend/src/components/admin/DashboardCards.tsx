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

export function DashboardCards({ summary }: DashboardCardsProps) {
  const cards = [
    {
      label: "Total Users",
      value: formatNumber(summary.totalUsers),
      helper: "All platform accounts",
      accent: "border-l-slate-900 dark:border-l-slate-100",
    },
    {
      label: "Total Customers",
      value: formatNumber(summary.totalCustomers),
      helper: "Active buyer ecosystem",
      accent: "border-l-sky-600",
    },
    {
      label: "Total Sellers",
      value: formatNumber(summary.totalSellers),
      helper: "Marketplace partners",
      accent: "border-l-violet-600",
    },
    {
      label: "Total Products",
      value: formatNumber(summary.totalProducts),
      helper: "Catalog inventory",
      accent: "border-l-emerald-600",
    },
    {
      label: "Total Orders",
      value: formatNumber(summary.totalOrders),
      helper: "Commerce transactions",
      accent: "border-l-amber-600",
    },
    {
      label: "Revenue",
      value: formatCurrency(summary.revenue),
      helper: "Recognized marketplace revenue",
      accent: "border-l-rose-600",
    },
    {
      label: "Pending Seller Requests",
      value: formatNumber(summary.pendingSellerRequests),
      helper: "Requires admin review",
      accent: "border-l-red-600",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`min-h-36 rounded-lg border border-l-4 border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${card.accent}`}
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {card.value}
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
