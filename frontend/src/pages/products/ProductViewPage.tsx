import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductDetailSections } from "@/components/products/ProductDetailSections";
import { ProductExtensionManager } from "@/components/products/ProductExtensionManager";
import { ProductImageManager } from "@/components/products/ProductImageManager";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { archiveProduct, getProduct, publishProduct, unpublishProduct } from "@/services/productService";
import { notify } from "@/services/notificationService";

export default function ProductViewPage() {
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(productId ?? ""),
    queryFn: () => getProduct(productId ?? ""),
    enabled: Boolean(productId)
  });

  const invalidateProduct = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId ?? "") });
  };

  const publishMutation = useMutation({
    mutationFn: () => publishProduct(productId ?? "", { visibility: "public" }),
    onSuccess: async () => {
      notify.success("Product published");
      await invalidateProduct();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishProduct(productId ?? ""),
    onSuccess: async () => {
      notify.success("Product unpublished");
      await invalidateProduct();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProduct(productId ?? ""),
    onSuccess: async () => {
      notify.success("Product archived");
      await invalidateProduct();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (productQuery.isLoading) {
    return <LoadingState label="Loading product details" />;
  }

  if (productQuery.isError || !productQuery.data?.data) {
    return <ErrorState title="Product not found" message={getApiErrorMessage(productQuery.error)} />;
  }

  const product = productQuery.data.data;

  return (
    <PageLayout
      title="Product Details"
      description="View product classification, pricing, lifecycle, dimensions, and publishing state."
      actions={
        <>
          <Link to={`/products/${product.id}/preview`}>
            <Button variant="secondary">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Link to={`/products/${product.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {product.status === "published" ? (
            <Button loading={unpublishMutation.isPending} onClick={() => unpublishMutation.mutate()}>
              Unpublish
            </Button>
          ) : (
            <Button
              loading={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
              disabled={product.status === "archived"}
            >
              Publish
            </Button>
          )}
          <Button variant="secondary" loading={archiveMutation.isPending} onClick={() => archiveMutation.mutate()}>
            Archive
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <ProductDetailSections product={product} />
        <ProductImageManager productId={product.id} />
        <ProductExtensionManager productId={product.id} />
      </div>
    </PageLayout>
  );
}
