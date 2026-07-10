import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductForm } from "@/components/products/ProductForm";
import type { ProductFormValues } from "@/components/products/productValidation";
import { queryKeys } from "@/lib/queryKeys";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import { notify } from "@/services/notificationService";
import { createProduct } from "@/services/productService";
import { getSellers } from "@/services/sellerService";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellersQuery = useQuery({
    queryKey: queryKeys.sellers.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getSellers({ page: 1, page_size: 100, status: "active" })
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getCategories({ page: 1, page_size: 100, status: "active" })
  });
  const brandsQuery = useQuery({
    queryKey: queryKeys.brands.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getBrands({ page: 1, page_size: 100, status: "active" })
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (response) => {
      notify.success("Product created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      if (response.data?.id) {
        navigate(`/products/${response.data.id}`);
      }
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  function handleSubmit(values: ProductFormValues) {
    createMutation.mutate(values);
  }

  return (
    <PageLayout title="Create Product" description="Create a seller product listing connected to the backend API.">
      <ProductForm
        mode="create"
        loading={createMutation.isPending}
        sellers={sellersQuery.data?.data?.items ?? []}
        categories={categoriesQuery.data?.data?.items ?? []}
        brands={brandsQuery.data?.data?.items ?? []}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
