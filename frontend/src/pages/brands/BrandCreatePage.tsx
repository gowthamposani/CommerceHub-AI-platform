import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { BrandForm } from "@/components/brands/BrandForm";
import type { BrandFormValues } from "@/components/brands/brandValidation";
import { PageLayout } from "@/components/layout/PageLayout";
import { queryKeys } from "@/lib/queryKeys";
import { createBrand } from "@/services/brandService";
import { notify } from "@/services/notificationService";

export default function BrandCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: async (response) => {
      notify.success("Brand created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      if (response.data?.id) {
        navigate(`/brands/${response.data.id}`);
      }
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  function handleSubmit(values: BrandFormValues) {
    createMutation.mutate(values);
  }

  return (
    <PageLayout title="Create Brand" description="Create a product brand connected to the backend brand API.">
      <BrandForm mode="create" loading={createMutation.isPending} onSubmit={handleSubmit} />
    </PageLayout>
  );
}
