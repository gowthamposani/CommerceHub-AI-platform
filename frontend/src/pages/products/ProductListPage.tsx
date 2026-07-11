import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { ProductStats } from "@/components/products/ProductStats";
import { ProductTable } from "@/components/products/ProductTable";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PRODUCT_SORT_OPTIONS, PRODUCT_STATUS_OPTIONS } from "@/constants/product";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import { notify } from "@/services/notificationService";
import {
  archiveProduct,
  deleteProduct,
  duplicateProduct,
  getProducts,
  publishProduct,
  unpublishProduct
} from "@/services/productService";
import type { Product, ProductStatus } from "@/types/product";

type ProductAction = "archive" | "delete" | null;

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState("");
  const [isPublished, setIsPublished] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pendingAction, setPendingAction] = useState<{ product: Product; action: ProductAction } | null>(null);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: status || undefined,
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    is_featured: isFeatured === "" ? undefined : isFeatured === "true",
    is_published: isPublished === "" ? undefined : isPublished === "true",
    sort_by: sortBy,
    sort_direction: sortDirection
  };

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params)
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getCategories({ page: 1, page_size: 100, status: "active" })
  });

  const brandsQuery = useQuery({
    queryKey: queryKeys.brands.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getBrands({ page: 1, page_size: 100, status: "active" })
  });

  const totalProductsQuery = useQuery({
    queryKey: queryKeys.products.stats("all"),
    queryFn: () => getProducts({ page: 1, page_size: 1 })
  });

  const publishedProductsQuery = useQuery({
    queryKey: queryKeys.products.stats("published"),
    queryFn: () => getProducts({ page: 1, page_size: 1, status: "published" })
  });

  const draftProductsQuery = useQuery({
    queryKey: queryKeys.products.stats("draft"),
    queryFn: () => getProducts({ page: 1, page_size: 1, status: "draft" })
  });

  const archivedProductsQuery = useQuery({
    queryKey: queryKeys.products.stats("archived"),
    queryFn: () => getProducts({ page: 1, page_size: 1, status: "archived" })
  });

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const publishMutation = useMutation({
    mutationFn: (product: Product) => publishProduct(product.id, { visibility: "public" }),
    onSuccess: async () => {
      notify.success("Product published");
      await invalidateProducts();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const unpublishMutation = useMutation({
    mutationFn: (product: Product) => unpublishProduct(product.id),
    onSuccess: async () => {
      notify.success("Product unpublished");
      await invalidateProducts();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const archiveMutation = useMutation({
    mutationFn: (product: Product) => archiveProduct(product.id),
    onSuccess: async () => {
      notify.success("Product archived");
      setPendingAction(null);
      await invalidateProducts();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const duplicateMutation = useMutation({
    mutationFn: (product: Product) => duplicateProduct(product.id),
    onSuccess: async (response) => {
      notify.success("Product duplicated");
      await invalidateProducts();
      if (response.data?.id) {
        navigate(`/products/${response.data.id}`);
      }
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: (product: Product) => deleteProduct(product.id),
    onSuccess: async () => {
      notify.success("Product deleted");
      setPendingAction(null);
      await invalidateProducts();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (productsQuery.isError) {
    return <ErrorState title="Unable to load products" message={getApiErrorMessage(productsQuery.error)} />;
  }

  const productData = productsQuery.data?.data;
  const categoryOptions = [
    { label: "All categories", value: "" },
    ...(categoriesQuery.data?.data?.items ?? []).map((category) => ({
      label: category.category_name,
      value: category.id
    }))
  ];
  const brandOptions = [
    { label: "All brands", value: "" },
    ...(brandsQuery.data?.data?.items ?? []).map((brand) => ({ label: brand.brand_name, value: brand.id }))
  ];

  return (
    <PageLayout
      title="Product Management"
      description="Create, publish, archive, duplicate, and manage seller product listings."
      actions={
        <Link to="/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </Link>
      }
    >
      <ProductStats
        totalProducts={totalProductsQuery.data?.data?.meta.total_items ?? 0}
        publishedProducts={publishedProductsQuery.data?.data?.meta.total_items ?? 0}
        draftProducts={draftProductsQuery.data?.data?.meta.total_items ?? 0}
        archivedProducts={archivedProductsQuery.data?.data?.meta.total_items ?? 0}
      />

      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as ProductStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...PRODUCT_STATUS_OPTIONS]}
          aria-label="Filter by status"
        />
        <Select
          value={categoryId}
          onChange={(event) => {
            setPage(1);
            setCategoryId(event.target.value);
          }}
          options={categoryOptions}
          aria-label="Filter by category"
        />
        <Select
          value={brandId}
          onChange={(event) => {
            setPage(1);
            setBrandId(event.target.value);
          }}
          options={brandOptions}
          aria-label="Filter by brand"
        />
        <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min price" />
        <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" />
        <Select
          value={isFeatured}
          onChange={(event) => setIsFeatured(event.target.value)}
          options={[
            { label: "All featured", value: "" },
            { label: "Featured", value: "true" },
            { label: "Not featured", value: "false" }
          ]}
          aria-label="Filter by featured"
        />
        <Select
          value={isPublished}
          onChange={(event) => setIsPublished(event.target.value)}
          options={[
            { label: "All publish states", value: "" },
            { label: "Published", value: "true" },
            { label: "Not published", value: "false" }
          ]}
          aria-label="Filter by published"
        />
        <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} options={PRODUCT_SORT_OPTIONS} />
        <Select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
          options={[
            { label: "Descending", value: "desc" },
            { label: "Ascending", value: "asc" }
          ]}
        />
      </FilterPanel>

      <ProductTable
        products={productData?.items ?? []}
        loading={productsQuery.isLoading}
        onPublish={(product) => publishMutation.mutate(product)}
        onUnpublish={(product) => unpublishMutation.mutate(product)}
        onArchive={(product) => setPendingAction({ product, action: "archive" })}
        onDuplicate={(product) => duplicateMutation.mutate(product)}
        onDelete={(product) => setPendingAction({ product, action: "delete" })}
        emptyAction={
          <Link to="/products/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Product
            </Button>
          </Link>
        }
      />

      {productData ? (
        <Pagination
          page={productData.meta.page}
          pageSize={productData.meta.page_size}
          totalItems={productData.meta.total_items}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
        />
      ) : null}

      <ConfirmationDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.action === "archive" ? "Archive product" : "Delete product"}
        message={
          pendingAction?.action === "archive"
            ? `Archive ${pendingAction.product.product_name}? Archived products cannot be published.`
            : `Soft delete ${pendingAction?.product.product_name ?? "this product"}? This hides it from active reads.`
        }
        confirmLabel={pendingAction?.action === "archive" ? "Archive" : "Delete"}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.action === "archive") archiveMutation.mutate(pendingAction.product);
          if (pendingAction.action === "delete") deleteMutation.mutate(pendingAction.product);
        }}
      />
    </PageLayout>
  );
}
