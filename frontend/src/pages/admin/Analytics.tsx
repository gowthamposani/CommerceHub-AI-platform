import { RefreshCw } from "lucide-react";

import { AnalyticsCharts } from "../../components/admin/AnalyticsCharts";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { useAnalytics } from "../../hooks/useAnalytics";

export default function Analytics() {
  const { data: analytics, error, loading, refetch } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revenue, sales, orders, categories, and growth performance
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-admin bg-admin-gold px-4 text-sm font-medium text-white transition duration-200 hover:bg-[#B67B24]"
          type="button"
          onClick={() => void refetch()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <EmptyState title="Analytics unavailable" description={error} />
      ) : analytics ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analytics.metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-admin border border-admin-border bg-white p-6 shadow-admin transition duration-200 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-sm text-admin-muted dark:text-slate-400">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-admin-ink dark:text-white">{metric.value}</p>
              </article>
            ))}
          </section>

          {analytics.generatedAt ? (
            <p className="text-sm text-admin-muted dark:text-slate-400">
              Generated at {new Date(analytics.generatedAt).toLocaleString()}
            </p>
          ) : null}

          <AnalyticsCharts analytics={analytics} />
        </>
      ) : (
        <EmptyState title="No analytics data available" />
      )}
    </div>
  );
}
