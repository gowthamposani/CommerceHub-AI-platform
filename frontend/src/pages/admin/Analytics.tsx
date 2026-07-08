import { useEffect, useState } from "react";

import { AnalyticsCharts } from "../../components/admin/AnalyticsCharts";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { Sidebar } from "../../components/admin/Sidebar";
import { TopNavbar } from "../../components/admin/TopNavbar";
import { getAnalytics, type AnalyticsData } from "../../services/admin.service";

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar title="Analytics" subtitle="Revenue, order, and catalog performance" />
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSkeleton rows={6} />
          ) : analytics ? (
            <AnalyticsCharts analytics={analytics} />
          ) : (
            <EmptyState title="No analytics data" description="Mock analytics are unavailable." />
          )}
        </main>
      </div>
    </div>
  );
}
