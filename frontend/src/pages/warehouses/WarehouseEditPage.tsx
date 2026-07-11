import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { WarehouseForm } from "@/components/warehouses/WarehouseForm";
import type { WarehouseFormValues } from "@/components/warehouses/warehouseValidation";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { getWarehouseById, updateWarehouse } from "@/services/warehouseService";

export default function WarehouseEditPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const warehouseQuery = useQuery({
    queryKey: queryKeys.warehouses.detail(warehouseId ?? ""),
    queryFn: () => getWarehouseById(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });
  const mutation = useMutation({
    mutationFn: (values: WarehouseFormValues) => {
      return updateWarehouse(warehouseId ?? "", {
        warehouse_name: values.warehouse_name,
        contact_person: values.contact_person,
        phone_number: values.phone_number,
        email: values.email,
        address_line_1: values.address_line_1,
        address_line_2: values.address_line_2,
        city: values.city,
        state: values.state,
        country: values.country,
        postal_code: values.postal_code,
        latitude: values.latitude,
        longitude: values.longitude,
        warehouse_type: values.warehouse_type,
        status: values.status,
        is_default: values.is_default
      });
    },
    onSuccess: async () => {
      notify.success("Warehouse updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      navigate(`/warehouses/${warehouseId}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (warehouseQuery.isLoading) return <LoadingState label="Loading warehouse" />;
  if (warehouseQuery.isError || !warehouseQuery.data?.data) {
    return <ErrorState title="Warehouse not found" message={getApiErrorMessage(warehouseQuery.error)} />;
  }

  return (
    <PageLayout title="Edit Warehouse" description="Update warehouse details, address, status, and default state.">
      <WarehouseForm
        mode="edit"
        warehouse={warehouseQuery.data.data}
        loading={mutation.isPending}
        onSubmit={mutation.mutate}
      />
    </PageLayout>
  );
}
