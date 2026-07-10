import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo, useMemo, type ReactNode } from "react";

import type {
  AnalyticsData,
  CategoryPerformance,
  OrdersPoint,
  RecentActivity,
  RevenuePoint,
} from "../../types/admin";
import { EmptyState } from "./EmptyState";

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

const categoryColors = ["#C98B2B", "#1F1A14", "#A56D1E", "#D8B06D", "#756B5E"];

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function formatTooltipCurrency(value: unknown): string {
  return formatCompactCurrency(typeof value === "number" ? value : Number(value) || 0);
}

function toneClass(tone: RecentActivity["tone"]): string {
  if (tone === "success") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900";
  }

  if (tone === "warning") {
    return "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900";
}

function ChartCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-admin border border-admin-border bg-white p-6 shadow-admin transition duration-200 dark:border-slate-800 dark:bg-slate-900">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-gold">{eyebrow}</p>
      ) : null}
      <h3 className="mt-1 text-base font-semibold text-admin-ink dark:text-white">{title}</h3>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export const AnalyticsCharts = memo(function AnalyticsCharts({
  analytics,
  monthlyRevenue,
  ordersOverview,
  topCategories,
  recentActivity,
}: DashboardChartsProps) {
  const resolvedMonthlyRevenue = useMemo(
    () => monthlyRevenue ?? analytics?.revenueSeries ?? [],
    [analytics?.revenueSeries, monthlyRevenue],
  );
  const resolvedOrdersOverview = useMemo(
    () => ordersOverview ?? analytics?.ordersOverview ?? [],
    [analytics?.ordersOverview, ordersOverview],
  );
  const resolvedTopCategories = useMemo(
    () => topCategories ?? analytics?.topCategories ?? [],
    [analytics?.topCategories, topCategories],
  );
  const resolvedRecentActivity = useMemo(() => recentActivity ?? [], [recentActivity]);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <ChartCard eyebrow="Revenue" title="Monthly Revenue">
        {resolvedMonthlyRevenue.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={resolvedMonthlyRevenue} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#C98B2B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C98B2B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E7DED2" strokeDasharray="4 4" vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value: number) => formatCompactCurrency(value)}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  formatter={(value: unknown) => [formatTooltipCurrency(value), "Revenue"]}
                  contentStyle={{ borderRadius: 16, borderColor: "#E7DED2" }}
                />
                <Area
                  dataKey="revenue"
                  fill="url(#adminRevenue)"
                  stroke="#C98B2B"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No revenue data available" />
        )}
      </ChartCard>

      <div className="space-y-6">
        <ChartCard eyebrow="Orders" title="Orders Overview">
          {resolvedOrdersOverview.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={resolvedOrdersOverview}>
                  <CartesianGrid stroke="#E7DED2" strokeDasharray="4 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="label" tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} width={42} />
                  <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E7DED2" }} />
                  <Bar dataKey="orders" fill="#C98B2B" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No orders data available" />
          )}
        </ChartCard>

        <ChartCard eyebrow="Categories" title="Top Categories">
          {resolvedTopCategories.length > 0 ? (
            <div className="grid items-center gap-4 sm:grid-cols-[160px_1fr]">
              <div className="h-40">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={resolvedTopCategories}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {resolvedTopCategories.map((category, index) => (
                        <Cell
                          fill={categoryColors[index % categoryColors.length]}
                          key={category.name}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E7DED2" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {resolvedTopCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2 text-sm text-admin-muted dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                      />
                      <span className="truncate">{category.name}</span>
                    </span>
                    <span className="text-sm font-semibold">{category.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No category data available" />
          )}
        </ChartCard>
      </div>

      {recentActivity ? (
        <section className="rounded-admin border border-admin-border bg-white p-6 shadow-admin dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-admin-gold">Activity</p>
          <h3 className="mt-1 text-base font-semibold">Recent Activities</h3>
          {resolvedRecentActivity.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {resolvedRecentActivity.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-admin border border-admin-border bg-admin-background p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass(
                      activity.tone,
                    )}`}
                  >
                    {activity.timestamp}
                  </span>
                  <h4 className="mt-4 text-sm font-semibold">{activity.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-admin-muted dark:text-slate-400">
                    {activity.description}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity available" />
          )}
        </section>
      ) : null}
    </section>
  );
});
