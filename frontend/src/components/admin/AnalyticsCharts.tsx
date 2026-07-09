import type {
  AnalyticsData,
  CategoryPerformance,
  OrdersPoint,
  RecentActivity,
  RevenuePoint,
} from "../../types/admin";

type DashboardChartsProps =
  | {
      analytics?: never;
      monthlyRevenue: RevenuePoint[];
      ordersOverview: OrdersPoint[];
      topCategories: CategoryPerformance[];
      recentActivity: RecentActivity[];
    }
  | {
      analytics: AnalyticsData;
      monthlyRevenue?: never;
      ordersOverview?: never;
      topCategories?: never;
      recentActivity?: never;
    };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function maxValue(values: number[]): number {
  return Math.max(...values, 1);
}

function toneClass(tone: RecentActivity["tone"]): string {
  if (tone === "success") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }

  if (tone === "warning") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  }

  return "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";
}

export function AnalyticsCharts({
  analytics,
  monthlyRevenue,
  ordersOverview,
  topCategories,
  recentActivity,
}: DashboardChartsProps) {
  const fallbackAnalytics = analytics ?? {
    revenueSeries: [],
    topCategories: [],
    topProducts: [],
  };
  const resolvedMonthlyRevenue =
    monthlyRevenue ??
    fallbackAnalytics.revenueSeries.map((item, index) => ({
      month: item.label.slice(0, 3) || `M${index + 1}`,
      revenue: Number(item.value.replace(/[^0-9.-]+/g, "")) || (index + 1) * 25000,
    }));
  const resolvedOrdersOverview =
    ordersOverview ??
    fallbackAnalytics.topProducts.map((product) => ({
      label: product.name.slice(0, 3),
      orders: product.orders,
    }));
  const resolvedTopCategories =
    topCategories ??
    fallbackAnalytics.topCategories.map((category) => ({
      name: category.name,
      value: category.share,
    }));
  const resolvedRecentActivity =
    recentActivity ??
    fallbackAnalytics.topProducts.slice(0, 3).map((product, index) => ({
      id: product.name,
      title: product.name,
      description: `${product.orders.toLocaleString()} orders recorded.`,
      timestamp: `${index + 1}h ago`,
      tone: "info" as const,
    }));

  const revenueMax = maxValue(resolvedMonthlyRevenue.map((point) => point.revenue));
  const orderMax = maxValue(resolvedOrdersOverview.map((point) => point.orders));
  const categoryMax = maxValue(resolvedTopCategories.map((category) => category.value));

  const revenuePolyline = resolvedMonthlyRevenue
    .map((point, index) => {
      const x = 20 + index * (260 / Math.max(resolvedMonthlyRevenue.length - 1, 1));
      const y = 170 - (point.revenue / revenueMax) * 130;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Monthly Revenue</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Revenue trend across the current reporting period.
            </p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {formatCurrency(resolvedMonthlyRevenue[resolvedMonthlyRevenue.length - 1]?.revenue ?? 0)}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
          <svg viewBox="0 0 300 190" className="h-64 w-full" role="img" aria-label="Monthly revenue line chart">
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              points={revenuePolyline}
              stroke="#059669"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <polygon fill="url(#revenueFill)" points={`20,180 ${revenuePolyline} 280,180`} />
            {resolvedMonthlyRevenue.map((point, index) => {
              const x = 20 + index * (260 / Math.max(resolvedMonthlyRevenue.length - 1, 1));
              const y = 170 - (point.revenue / revenueMax) * 130;

              return (
                <g key={point.month}>
                  <circle cx={x} cy={y} fill="#ffffff" r="5" stroke="#059669" strokeWidth="3" />
                  <text
                    fill="currentColor"
                    fontSize="10"
                    textAnchor="middle"
                    x={x}
                    y="188"
                  >
                    {point.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Orders Overview</h2>
          <div className="mt-5 flex h-48 items-end gap-2" aria-label="Orders overview bar chart">
            {resolvedOrdersOverview.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-md bg-slate-100 dark:bg-slate-800">
                  <div
                    className="w-full rounded-md bg-sky-600"
                    style={{ height: `${Math.max(12, (point.orders / orderMax) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Top Categories</h2>
          <div className="mt-5 space-y-3">
            {resolvedTopCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-medium">{category.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-violet-600"
                    style={{ width: `${Math.max(8, (category.value / categoryMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
        <h2 className="text-base font-semibold">Recent Activity</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {resolvedRecentActivity.map((activity) => (
            <article
              key={activity.id}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass(activity.tone)}`}>
                {activity.timestamp}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{activity.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {activity.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
