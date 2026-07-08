import { useEffect, useState } from "react";
import { Activity, AlertCircle, PackageCheck, ShoppingBag, Users } from "lucide-react";

import { DashboardCards } from "../../components/admin/DashboardCards";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { Sidebar } from "../../components/admin/Sidebar";
import { TopNavbar } from "../../components/admin/TopNavbar";
import { getDashboardData, type DashboardSummary } from "../../services/admin.service";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardData()
      .then((data) => {
        if (isMounted) {
          setDashboard(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar title="Admin Dashboard" subtitle="Operational command center" />
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : dashboard ? (
            <>
              <DashboardCards summary={dashboard} />

              <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                        Commerce Health
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Snapshot of marketplace activity and administrative workload.
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Active Users",
                        value: dashboard.activeUsers.toLocaleString(),
                        icon: Users,
                      },
                      {
                        label: "Products",
                        value: dashboard.totalProducts.toLocaleString(),
                        icon: PackageCheck,
                      },
                      {
                        label: "Orders",
                        value: dashboard.totalOrders.toLocaleString(),
                        icon: ShoppingBag,
                      },
                      {
                        label: "Seller Requests",
                        value: dashboard.pendingSellerRequests.toLocaleString(),
                        icon: AlertCircle,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <item.icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-base font-semibold">Admin Queue</h2>
                  <div className="mt-5 space-y-3">
                    {dashboard.queue.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <EmptyState
              title="No dashboard data"
              description="Mock dashboard data is currently unavailable."
            />
          )}
        </main>
      </div>
    </div>
  );
}
