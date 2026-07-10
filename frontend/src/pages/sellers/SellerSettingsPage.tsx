import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { SellerSettingsForm } from "@/components/sellers/SellerSettingsForm";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { getSeller, updateSeller } from "@/services/sellerService";

export default function SellerSettingsPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const queryClient = useQueryClient();

  const sellerQuery = useQuery({
    queryKey: queryKeys.sellers.detail(sellerId ?? ""),
    queryFn: () => getSeller(sellerId ?? ""),
    enabled: Boolean(sellerId)
  });

  const updateMutation = useMutation({
    mutationFn: (values: {
      default_currency: string;
      notifications_enabled: boolean;
      order_auto_accept_enabled: boolean;
    }) => updateSeller(sellerId ?? "", values),
    onSuccess: async () => {
      notify.success("Seller settings updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.detail(sellerId ?? "") });
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (sellerQuery.isLoading) {
    return <LoadingState label="Loading seller settings" />;
  }

  if (sellerQuery.isError || !sellerQuery.data?.data) {
    return <ErrorState title="Seller not found" message={getApiErrorMessage(sellerQuery.error)} />;
  }

  return (
    <PageLayout title="Seller Settings" description="Manage seller preferences persisted through the seller API.">
      <SellerSettingsForm
        seller={sellerQuery.data.data}
        loading={updateMutation.isPending}
        onSubmit={updateMutation.mutate}
      />
    </PageLayout>
  );
}
