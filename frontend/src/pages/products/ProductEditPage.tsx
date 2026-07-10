import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductForm } from "@/components/products/ProductForm";
import type { ProductFormValues } from "@/components/products/productValidation";
import { queryKeys } from "@/lib/queryKeys";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import { notify } from "@/services/notificationService";
import { getProduct, updateProduct } from "@/services/productService";
import { getSellers } from "@/services/sellerService";

export default function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(productId ?? ""),
    queryFn: () => getProduct(productId ?? ""),
    enabled: Boolean(productId)
  });
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

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(productId ?? "", values),
    onSuccess: async () => {
      notify.success("Product updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId ?? "") });
      navigate(`/products/${productId}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (productQuery.isLoading) {
    return <LoadingState label="Loading product" />;
  }

  if (productQuery.isError || !productQuery.data?.data) {
    return <ErrorState title="Product not found" message={getApiErrorMessage(productQuery.error)} />;
  }

  return (
    <PageLayout
      title="Edit Product"
      description="Update product classification, pricing, descriptions, and visibility."
    >
      <ProductForm
        product={productQuery.data.data}
        mode="edit"
        loading={updateMutation.isPending}
        sellers={sellersQuery.data?.data?.items ?? []}
        categories={categoriesQuery.data?.data?.items ?? []}
        brands={brandsQuery.data?.data?.items ?? []}
        onSubmit={updateMutation.mutate}
      />
    </PageLayout>
  );
}
