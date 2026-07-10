import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { WarehouseCapacityPanel } from "@/components/warehouses/WarehouseCapacityPanel";
import { WarehouseCharts } from "@/components/warehouses/WarehouseCharts";
import { queryKeys } from "@/lib/queryKeys";
import { getWarehouseById, getWarehouseCapacity } from "@/services/warehouseService";

export default function WarehouseCapacityPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const warehouseQuery = useQuery({
    queryKey: queryKeys.warehouses.detail(warehouseId ?? ""),
    queryFn: () => getWarehouseById(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });
  const capacityQuery = useQuery({
    queryKey: queryKeys.warehouses.capacity(warehouseId ?? ""),
    queryFn: () => getWarehouseCapacity(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });

  if (warehouseQuery.isLoading || capacityQuery.isLoading) return <LoadingState label="Loading warehouse capacity" />;
  if (warehouseQuery.isError || !warehouseQuery.data?.data) {
    return <ErrorState title="Warehouse not found" message={getApiErrorMessage(warehouseQuery.error)} />;
  }

  return (
    <PageLayout
      title="Warehouse Capacity"
      description={`Capacity utilization and storage warning signals for ${warehouseQuery.data.data.warehouse_name}.`}
    >
      <WarehouseCapacityPanel capacity={capacityQuery.data?.data} />
      <WarehouseCharts
        warehouses={[warehouseQuery.data.data]}
        capacities={capacityQuery.data?.data ? [capacityQuery.data.data] : []}
      />
    </PageLayout>
  );
}
