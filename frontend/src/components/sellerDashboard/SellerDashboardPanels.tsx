import { AlertTriangle, CheckCircle2, Info, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SELLER_DASHBOARD_QUICK_ACTIONS } from "@/constants/sellerDashboard";
import { formatDate } from "@/utils/formatters";
import type { DashboardActivity, DashboardAlert, DashboardSearchResult } from "@/types/sellerDashboard";

function severityIcon(severity: string) {
  if (severity === "critical") return AlertTriangle;
  if (severity === "warning") return Info;
  return CheckCircle2;
}

export function SellerDashboardAlertsPanel({
  alerts,
  onDismiss
}: {
  alerts: DashboardAlert[];
  onDismiss: (alertId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Operational Alerts</h2>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-gray-500">No operational alerts.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = severityIcon(alert.severity);
              return (
                <div key={alert.id} className="flex gap-3 rounded-lg border border-gray-100 p-3">
                  <Icon className="mt-0.5 h-5 w-5 text-brand-red" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-950">{alert.title}</p>
                      <Badge tone={alert.severity === "critical" ? "danger" : "warning"}>{alert.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">{formatDate(alert.created_at)}</p>
                  </div>
                  <Button size="sm" variant="ghost" aria-label={`Dismiss ${alert.title}`} onClick={() => onDismiss(alert.id)}>
                    Dismiss
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SellerDashboardActivityTimeline({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Recent Activities</h2>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-gray-500">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-brand-gold" />
                <div>
                  <p className="text-sm font-bold text-gray-950">{activity.label}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">{formatDate(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SellerDashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Quick Actions</h2>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {SELLER_DASHBOARD_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              {action.label}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SellerDashboardSearchPanel({
  value,
  onChange,
  results,
  loading
}: {
  value: string;
  onChange: (value: string) => void;
  results: DashboardSearchResult[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Dashboard Search</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchBar value={value} onChange={onChange} placeholder="Search products, inventory, or warehouses" />
        {loading ? <p className="text-sm font-semibold text-gray-500">Searching live dashboard data...</p> : null}
        {!loading && value && results.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500">No dashboard results found.</p>
        ) : null}
        {!loading && results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
              >
                <Search className="mt-1 h-4 w-4 text-gray-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">{result.label}</p>
                  <p className="text-sm text-gray-600">{result.description ?? result.type}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {result.type} · {result.status ?? "active"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
