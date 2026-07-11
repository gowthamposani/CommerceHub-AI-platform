import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Boxes, Edit, Gauge, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { WarehouseActivityTimeline } from "@/components/warehouses/WarehouseActivityTimeline";
import { WarehouseCapacityPanel } from "@/components/warehouses/WarehouseCapacityPanel";
import { WarehouseDetailSections } from "@/components/warehouses/WarehouseDetailSections";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import {
  getWarehouseById,
  getWarehouseCapacity,
  getWarehouseInventorySummary,
  setDefaultWarehouse
} from "@/services/warehouseService";
import type { WarehouseActivity } from "@/types/warehouse";

export default function WarehouseViewPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const queryClient = useQueryClient();
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
  const summaryQuery = useQuery({
    queryKey: queryKeys.warehouses.inventorySummary(warehouseId ?? ""),
    queryFn: () => getWarehouseInventorySummary(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });
  const defaultMutation = useMutation({
    mutationFn: () => setDefaultWarehouse(warehouseId ?? ""),
    onSuccess: async () => {
      notify.success("Default warehouse updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (warehouseQuery.isLoading) return <LoadingState label="Loading warehouse details" />;
  if (warehouseQuery.isError || !warehouseQuery.data?.data) {
    return <ErrorState title="Warehouse not found" message={getApiErrorMessage(warehouseQuery.error)} />;
  }

  const warehouse = warehouseQuery.data.data;
  const activities: WarehouseActivity[] = [
    {
      id: `${warehouse.id}-created`,
      type: "created",
      label: "Warehouse Created",
      description: `${warehouse.warehouse_name} was created for seller operations.`,
      timestamp: warehouse.created_at
    },
    {
      id: `${warehouse.id}-updated`,
      type: "updated",
      label: "Warehouse Updated",
      description: "Warehouse details were last updated.",
      timestamp: warehouse.updated_at
    },
    {
      id: `${warehouse.id}-status`,
      type: "status",
      label: "Status Changed",
      description: `Current warehouse status is ${warehouse.status}.`,
      timestamp: warehouse.updated_at
    }
  ];

  return (
    <PageLayout
      title="Warehouse Details"
      description="Review warehouse contact information, capacity, inventory summary, and operational activity."
      actions={
        <>
          <Link to={`/warehouses/${warehouse.id}/inventory`}>
            <Button variant="secondary">
              <Boxes className="h-4 w-4" />
              Inventory
            </Button>
          </Link>
          <Link to={`/warehouses/${warehouse.id}/capacity`}>
            <Button variant="secondary">
              <Gauge className="h-4 w-4" />
              Capacity
            </Button>
          </Link>
          <Link to={`/warehouses/${warehouse.id}/activity`}>
            <Button variant="secondary">
              <Activity className="h-4 w-4" />
              Activity
            </Button>
          </Link>
          <Link to={`/warehouses/${warehouse.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            disabled={warehouse.is_default}
            loading={defaultMutation.isPending}
            onClick={() => defaultMutation.mutate()}
          >
            <Star className="h-4 w-4" />
            Set Default
          </Button>
        </>
      }
    >
      <WarehouseDetailSections
        warehouse={warehouse}
        capacity={capacityQuery.data?.data}
        summary={summaryQuery.data?.data}
      />
      <WarehouseCapacityPanel capacity={capacityQuery.data?.data} />
      <WarehouseActivityTimeline activities={activities} />
    </PageLayout>
  );
}
