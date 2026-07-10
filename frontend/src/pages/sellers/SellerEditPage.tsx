import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { SellerForm } from "@/components/sellers/SellerForm";
import type { SellerFormValues } from "@/components/sellers/sellerValidation";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { getSeller, updateSeller } from "@/services/sellerService";

export default function SellerEditPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellerQuery = useQuery({
    queryKey: queryKeys.sellers.detail(sellerId ?? ""),
    queryFn: () => getSeller(sellerId ?? ""),
    enabled: Boolean(sellerId)
  });

  const updateMutation = useMutation({
    mutationFn: (values: SellerFormValues) => updateSeller(sellerId ?? "", values),
    onSuccess: async () => {
      notify.success("Seller updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.detail(sellerId ?? "") });
      navigate(`/sellers/${sellerId}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (sellerQuery.isLoading) {
    return <LoadingState label="Loading seller" />;
  }

  if (sellerQuery.isError || !sellerQuery.data?.data) {
    return <ErrorState title="Seller not found" message={getApiErrorMessage(sellerQuery.error)} />;
  }

  return (
    <PageLayout
      title="Edit Seller"
      description="Update seller business, address, tax, banking, and preference details."
    >
      <SellerForm
        seller={sellerQuery.data.data}
        mode="edit"
        loading={updateMutation.isPending}
        onSubmit={updateMutation.mutate}
      />
    </PageLayout>
  );
}
