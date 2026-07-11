import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { BrandForm } from "@/components/brands/BrandForm";
import type { BrandFormValues } from "@/components/brands/brandValidation";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { queryKeys } from "@/lib/queryKeys";
import { getBrand, updateBrand } from "@/services/brandService";
import { notify } from "@/services/notificationService";

export default function BrandEditPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const brandQuery = useQuery({
    queryKey: queryKeys.brands.detail(brandId ?? ""),
    queryFn: () => getBrand(brandId ?? ""),
    enabled: Boolean(brandId)
  });

  const updateMutation = useMutation({
    mutationFn: (values: BrandFormValues) => updateBrand(brandId ?? "", values),
    onSuccess: async () => {
      notify.success("Brand updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(brandId ?? "") });
      navigate(`/brands/${brandId}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (brandQuery.isLoading) {
    return <LoadingState label="Loading brand" />;
  }

  if (brandQuery.isError || !brandQuery.data?.data) {
    return <ErrorState title="Brand not found" message={getApiErrorMessage(brandQuery.error)} />;
  }

  return (
    <PageLayout title="Edit Brand" description="Update brand identity, website, origin, founded year, and logo.">
      <BrandForm
        brand={brandQuery.data.data}
        mode="edit"
        loading={updateMutation.isPending}
        onSubmit={updateMutation.mutate}
      />
    </PageLayout>
  );
}
