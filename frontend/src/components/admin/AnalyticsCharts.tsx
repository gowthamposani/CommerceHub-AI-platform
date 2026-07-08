import { TrendingUp } from "lucide-react";

import type { AnalyticsData } from "../../services/admin.service";

type AnalyticsChartsProps = {
  analytics: AnalyticsData;
};

function barWidthClass(value: number) {
  if (value >= 90) return "w-11/12";
  if (value >= 75) return "w-9/12";
  if (value >= 60) return "w-7/12";
  if (value >= 45) return "w-6/12";
  if (value >= 30) return "w-4/12";
  return "w-3/12";
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Monthly Revenue</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mock revenue performance by week.
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        </div>

        <div className="mt-6 space-y-4">
          {analytics.revenueSeries.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-slate-500 dark:text-slate-400">{item.value}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-3 rounded-full bg-emerald-600 ${barWidthClass(item.score)}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Top Categories</h2>
          <div className="mt-5 space-y-3">
            {analytics.topCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-medium">{category.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-2 rounded-full bg-sky-600 ${barWidthClass(category.share)}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Top Products</h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {analytics.topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between py-3">
                <span className="text-sm">{product.name}</span>
                <span className="text-sm font-semibold">{product.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
