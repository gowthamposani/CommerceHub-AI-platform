import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { BrandDetailSections } from "@/components/brands/BrandDetailSections";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { activateBrand, deactivateBrand, getBrand } from "@/services/brandService";
import { notify } from "@/services/notificationService";

export default function BrandViewPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const queryClient = useQueryClient();

  const brandQuery = useQuery({
    queryKey: queryKeys.brands.detail(brandId ?? ""),
    queryFn: () => getBrand(brandId ?? ""),
    enabled: Boolean(brandId)
  });

  const invalidateBrand = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(brandId ?? "") });
  };

  const activateMutation = useMutation({
    mutationFn: activateBrand,
    onSuccess: async () => {
      notify.success("Brand activated");
      await invalidateBrand();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateBrand,
    onSuccess: async () => {
      notify.success("Brand deactivated");
      await invalidateBrand();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (brandQuery.isLoading) {
    return <LoadingState label="Loading brand details" />;
  }

  if (brandQuery.isError || !brandQuery.data?.data) {
    return <ErrorState title="Brand not found" message={getApiErrorMessage(brandQuery.error)} />;
  }

  const brand = brandQuery.data.data;

  return (
    <PageLayout
      title="Brand Details"
      description="View brand identity, lifecycle status, origin, website, and logo."
      actions={
        <>
          <Link to={`/brands/${brand.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {brand.is_active ? (
            <Button loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(brand.id)}>
              Deactivate
            </Button>
          ) : (
            <Button loading={activateMutation.isPending} onClick={() => activateMutation.mutate(brand.id)}>
              Activate
            </Button>
          )}
        </>
      }
    >
      <BrandDetailSections brand={brand} />
    </PageLayout>
  );
}
