import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { WarehouseActivityTimeline } from "@/components/warehouses/WarehouseActivityTimeline";
import { queryKeys } from "@/lib/queryKeys";
import { getWarehouseActivity, getWarehouseById } from "@/services/warehouseService";

export default function WarehouseActivityPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const warehouseQuery = useQuery({
    queryKey: queryKeys.warehouses.detail(warehouseId ?? ""),
    queryFn: () => getWarehouseById(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });
  const activityQuery = useQuery({
    queryKey: queryKeys.warehouses.activity(warehouseId ?? ""),
    queryFn: () => getWarehouseActivity(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });

  if (warehouseQuery.isLoading) return <LoadingState label="Loading warehouse activity" />;
  if (warehouseQuery.isError || !warehouseQuery.data?.data) {
    return <ErrorState title="Warehouse not found" message={getApiErrorMessage(warehouseQuery.error)} />;
  }

  const warehouse = warehouseQuery.data.data;

  return (
    <PageLayout title="Warehouse Activity" description={`Operational timeline for ${warehouse.warehouse_name}.`}>
      <WarehouseActivityTimeline activities={activityQuery.data?.data?.items ?? []} />
    </PageLayout>
  );
}
