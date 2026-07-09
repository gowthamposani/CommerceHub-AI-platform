import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { SellerForm } from "@/components/sellers/SellerForm";
import type { SellerFormValues } from "@/components/sellers/sellerValidation";
import { PageLayout } from "@/components/layout/PageLayout";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { createSeller } from "@/services/sellerService";

export default function SellerCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createSeller,
    onSuccess: async (response) => {
      notify.success("Seller created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.all });
      if (response.data?.id) {
        navigate(`/sellers/${response.data.id}`);
      }
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  function handleSubmit(values: SellerFormValues) {
    createMutation.mutate(values);
  }

  return (
    <PageLayout title="Create Seller" description="Create a seller profile connected to the backend seller API.">
      <SellerForm mode="create" loading={createMutation.isPending} onSubmit={handleSubmit} />
    </PageLayout>
  );
}
