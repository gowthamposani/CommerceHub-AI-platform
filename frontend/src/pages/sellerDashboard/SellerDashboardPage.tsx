import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { SellerDashboardCharts } from "@/components/sellerDashboard/SellerDashboardCharts";
import { SellerDashboardKpis } from "@/components/sellerDashboard/SellerDashboardKpis";
import {
  SellerDashboardActivityTimeline,
  SellerDashboardAlertsPanel,
  SellerDashboardQuickActions,
  SellerDashboardSearchPanel
} from "@/components/sellerDashboard/SellerDashboardPanels";
import { SellerDashboardWidgets } from "@/components/sellerDashboard/SellerDashboardWidgets";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DASHBOARD_DATE_PRESETS } from "@/constants/sellerDashboard";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { getSellers } from "@/services/sellerService";
import {
  getSellerDashboardOverview,
  searchSellerDashboard
} from "@/services/sellerDashboardService";
import type { DashboardDatePreset } from "@/types/sellerDashboard";

function configuredSellerId(): string {
  return import.meta.env.VITE_SELLER_ID ?? "";
}

export default function SellerDashboardPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [preset, setPreset] = useState<DashboardDatePreset>("last_30_days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const configuredId = configuredSellerId();
  const sellersQuery = useQuery({
    queryKey: queryKeys.sellers.list({ page: 1, page_size: 1, status: "active" }),
    queryFn: () => getSellers({ page: 1, page_size: 1, status: "active" }),
    enabled: !configuredId
  });

  const sellerId = configuredId || sellersQuery.data?.data?.items[0]?.id || "";
  const dateParams = {
    seller_id: sellerId,
    preset,
    start_date: preset === "custom" ? startDate || undefined : undefined,
    end_date: preset === "custom" ? endDate || undefined : undefined
  };

  const overviewQuery = useQuery({
    queryKey: queryKeys.sellerDashboard.overview(dateParams),
    queryFn: () => getSellerDashboardOverview(dateParams),
    enabled: Boolean(sellerId) && (preset !== "custom" || Boolean(startDate && endDate)),
    refetchInterval: 60_000
  });

  const searchParams = {
    seller_id: sellerId,
    q: debouncedSearch,
    page: 1,
    page_size: 8
  };
  const searchQuery = useQuery({
    queryKey: queryKeys.sellerDashboard.search(searchParams),
    queryFn: () => searchSellerDashboard(searchParams),
    enabled: Boolean(sellerId && debouncedSearch)
  });

  const overview = overviewQuery.data?.data;
  const visibleAlerts = useMemo(
    () => (overview?.alerts ?? []).filter((alert) => !dismissedAlertIds.includes(alert.id)),
    [dismissedAlertIds, overview?.alerts]
  );

  const refreshDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard.all });
  };

  if (sellersQuery.isLoading || overviewQuery.isLoading) {
    return <LoadingState label="Loading seller dashboard" />;
  }

  if (!sellerId) {
    return (
      <ErrorState
        title="No active seller found"
        message="Create or activate a seller profile before opening the seller dashboard."
      />
    );
  }

  if (overviewQuery.isError) {
    return <ErrorState title="Unable to load seller dashboard" message={getApiErrorMessage(overviewQuery.error)} />;
  }

  if (!overview) {
    return <LoadingState label="Preparing seller dashboard" />;
  }

  return (
    <PageLayout
      title="Seller Dashboard"
      description="Monitor store performance, inventory health, warehouse capacity, alerts, and seller operations."
      actions={
        <Button variant="secondary" onClick={() => void refreshDashboard()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
        <Select
          value={preset}
          onChange={(event) => setPreset(event.target.value as DashboardDatePreset)}
          options={DASHBOARD_DATE_PRESETS}
          aria-label="Dashboard date preset"
        />
        {preset === "custom" ? (
          <>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="Dashboard start date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-label="Dashboard end date"
            />
          </>
        ) : null}
      </div>

      <SellerDashboardKpis overview={overview} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <SellerDashboardCharts
            salesTrend={overview.charts.sales_trend}
            inventoryTrend={overview.charts.inventory_trend}
            warehouseCapacity={overview.charts.warehouse_capacity}
            topProducts={overview.charts.top_products}
            topCategories={overview.charts.category_sales}
          />
          <SellerDashboardWidgets
            products={overview.products}
            inventory={overview.inventory}
            warehouses={overview.warehouses}
            orders={overview.orders}
            revenue={overview.revenue}
            customers={overview.customers}
          />
        </div>
        <div className="space-y-4">
          <SellerDashboardSearchPanel
            value={search}
            onChange={setSearch}
            results={searchQuery.data?.data?.items ?? []}
            loading={searchQuery.isLoading}
          />
          <SellerDashboardAlertsPanel
            alerts={visibleAlerts}
            onDismiss={(alertId) => setDismissedAlertIds((current) => [...current, alertId])}
          />
          <SellerDashboardActivityTimeline activities={overview.recent_activities} />
          <SellerDashboardQuickActions />
        </div>
      </div>
    </PageLayout>
  );
}
