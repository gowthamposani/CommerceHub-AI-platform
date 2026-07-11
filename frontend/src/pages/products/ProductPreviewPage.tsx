import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductDetailSections } from "@/components/products/ProductDetailSections";
import { queryKeys } from "@/lib/queryKeys";
import { getProductPreview } from "@/services/productService";

export default function ProductPreviewPage() {
  const { productId } = useParams<{ productId: string }>();

  const productQuery = useQuery({
    queryKey: queryKeys.products.preview(productId ?? ""),
    queryFn: () => getProductPreview(productId ?? ""),
    enabled: Boolean(productId)
  });

  if (productQuery.isLoading) {
    return <LoadingState label="Loading product preview" />;
  }

  if (productQuery.isError || !productQuery.data?.data) {
    return <ErrorState title="Product preview unavailable" message={getApiErrorMessage(productQuery.error)} />;
  }

  return (
    <PageLayout
      title="Product Preview"
      description="Preview the backend product payload before publishing or catalog expansion."
    >
      <ProductDetailSections product={productQuery.data.data} preview />
    </PageLayout>
  );
}
