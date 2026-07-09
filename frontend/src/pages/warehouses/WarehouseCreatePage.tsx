import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { PageLayout } from "@/components/layout/PageLayout";
import { WarehouseForm } from "@/components/warehouses/WarehouseForm";
import type { WarehouseFormValues } from "@/components/warehouses/warehouseValidation";
import { createWarehouse } from "@/services/warehouseService";
import { notify } from "@/services/notificationService";

export default function WarehouseCreatePage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (values: WarehouseFormValues) =>
      createWarehouse({ ...values, warehouse_code: values.warehouse_code.toUpperCase() }),
    onSuccess: (response) => {
      notify.success("Warehouse created");
      if (response.data?.id) navigate(`/warehouses/${response.data.id}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  return (
    <PageLayout title="Create Warehouse" description="Create a seller-owned warehouse location.">
      <WarehouseForm mode="create" loading={mutation.isPending} onSubmit={mutation.mutate} />
    </PageLayout>
  );
}
