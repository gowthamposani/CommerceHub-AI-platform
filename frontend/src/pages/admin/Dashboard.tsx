import { AnalyticsCharts } from "../../components/admin/AnalyticsCharts";
import { DashboardCards } from "../../components/admin/DashboardCards";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { useDashboard } from "../../hooks/useDashboard";
import { AdminDashboardLayout } from "../../layouts/AdminDashboardLayout";
import type {
  NotificationItem,
  QuickAction,
  RecentOrder,
  SystemStatusItem,
} from "../../types/admin";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function notificationClass(severity: NotificationItem["severity"]): string {
  if (severity === "critical") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200";
  }

  if (severity === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";
  }

  return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200";
}

function statusClass(state: SystemStatusItem["state"]): string {
  if (state === "healthy") {
    return "bg-emerald-500";
  }

  if (state === "degraded") {
    return "bg-amber-500";
  }

  return "bg-sky-500";
}

function LatestNotifications({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Latest Notifications</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {notifications.length} active
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-lg border p-4 ${notificationClass(notification.severity)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">{notification.title}</h3>
                <p className="mt-1 text-sm opacity-80">{notification.message}</p>
              </div>
              <span className="shrink-0 text-xs font-medium">{notification.createdAt}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold">Recent Orders</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <tr>
              <th className="whitespace-nowrap py-3 pr-4 font-semibold">Order</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Customer</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Seller</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
              <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap py-4 pr-4 font-medium">{order.id}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                  {order.customer}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                  {order.seller}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-4 text-right font-semibold">
                  {formatCurrency(order.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold">Quick Actions</h2>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950"
          >
            <h3 className="text-sm font-semibold">{action.label}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

function SystemStatus({ items }: { items: SystemStatusItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold">System Status</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusClass(item.state)}`} />
              <span className="truncate text-sm font-medium">{item.label}</span>
            </div>
            <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { data: dashboard, error, loading, refetch } = useDashboard();

  return (
    <AdminDashboardLayout
      title="Admin Dashboard"
      subtitle="Marketplace command center for operations, analytics, and AI workflows"
    >
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : dashboard ? (
        <>
          {error || dashboard.dataSource === "mock" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Live backend data is unavailable. Showing enterprise dashboard mock data.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Generated at
              </p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(dashboard.generatedAt).toLocaleString()}
              </p>
            </div>
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              type="button"
              onClick={() => void refetch()}
            >
              Refresh Dashboard
            </button>
          </div>

          <DashboardCards summary={dashboard} />

          <AnalyticsCharts
            monthlyRevenue={dashboard.monthlyRevenue}
            ordersOverview={dashboard.ordersOverview}
            recentActivity={dashboard.recentActivity}
            topCategories={dashboard.topCategories}
          />

          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <LatestNotifications notifications={dashboard.latestNotifications} />
            <QuickActions actions={dashboard.quickActions} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <RecentOrders orders={dashboard.recentOrders} />
            <SystemStatus items={dashboard.systemStatus} />
          </section>
        </>
      ) : (
        <EmptyState
          title="No dashboard data"
          description="Dashboard data is currently unavailable. Try refreshing the page."
        />
      )}
    </AdminDashboardLayout>
  );
}
