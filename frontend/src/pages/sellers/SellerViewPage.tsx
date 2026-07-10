import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Settings } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { SellerDetailSections } from "@/components/sellers/SellerDetailSections";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { activateSeller, deactivateSeller, getSeller } from "@/services/sellerService";

export default function SellerViewPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const queryClient = useQueryClient();

  const sellerQuery = useQuery({
    queryKey: queryKeys.sellers.detail(sellerId ?? ""),
    queryFn: () => getSeller(sellerId ?? ""),
    enabled: Boolean(sellerId)
  });

  const invalidateSeller = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.detail(sellerId ?? "") });
    await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.all });
  };

  const activateMutation = useMutation({
    mutationFn: activateSeller,
    onSuccess: async () => {
      notify.success("Seller activated");
      await invalidateSeller();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateSeller,
    onSuccess: async () => {
      notify.success("Seller deactivated");
      await invalidateSeller();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (sellerQuery.isLoading) {
    return <LoadingState label="Loading seller profile" />;
  }

  if (sellerQuery.isError || !sellerQuery.data?.data) {
    return <ErrorState title="Seller not found" message={getApiErrorMessage(sellerQuery.error)} />;
  }

  const seller = sellerQuery.data.data;

  return (
    <PageLayout
      title="Seller Profile"
      description="View seller business profile, status, tax, address, and banking details."
      actions={
        <>
          <Link to={`/sellers/${seller.id}/settings`}>
            <Button variant="secondary">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link to={`/sellers/${seller.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {seller.is_active ? (
            <Button loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(seller.id)}>
              Deactivate
            </Button>
          ) : (
            <Button loading={activateMutation.isPending} onClick={() => activateMutation.mutate(seller.id)}>
              Activate
            </Button>
          )}
        </>
      }
    >
      <SellerDetailSections seller={seller} />
    </PageLayout>
  );
}
