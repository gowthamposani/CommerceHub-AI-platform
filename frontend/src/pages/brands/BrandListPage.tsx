import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { BrandStats } from "@/components/brands/BrandStats";
import { BrandTable } from "@/components/brands/BrandTable";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BRAND_SORT_OPTIONS, BRAND_STATUS_OPTIONS } from "@/constants/brand";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { activateBrand, deactivateBrand, deleteBrand, getBrands } from "@/services/brandService";
import { notify } from "@/services/notificationService";
import type { Brand, BrandStatus } from "@/types/brand";

export default function BrandListPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<BrandStatus | "">("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: status || undefined,
    country_of_origin: countryOfOrigin || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection
  };

  const brandsQuery = useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => getBrands(params)
  });

  const totalBrandsQuery = useQuery({
    queryKey: queryKeys.brands.stats("all"),
    queryFn: () => getBrands({ page: 1, page_size: 1 })
  });

  const activeBrandsQuery = useQuery({
    queryKey: queryKeys.brands.stats("active"),
    queryFn: () => getBrands({ page: 1, page_size: 1, status: "active" })
  });

  const inactiveBrandsQuery = useQuery({
    queryKey: queryKeys.brands.stats("inactive"),
    queryFn: () => getBrands({ page: 1, page_size: 1, status: "inactive" })
  });

  const invalidateBrands = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
  };

  const activateMutation = useMutation({
    mutationFn: activateBrand,
    onSuccess: async () => {
      notify.success("Brand activated");
      await invalidateBrands();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateBrand,
    onSuccess: async () => {
      notify.success("Brand deactivated");
      await invalidateBrands();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: async () => {
      notify.success("Brand deleted");
      setBrandToDelete(null);
      await invalidateBrands();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (brandsQuery.isError) {
    return <ErrorState title="Unable to load brands" message={getApiErrorMessage(brandsQuery.error)} />;
  }

  const brandData = brandsQuery.data?.data;

  return (
    <PageLayout
      title="Brand Management"
      description="Create, review, update, activate, deactivate, and soft delete product brands."
      actions={
        <Link to="/brands/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Brand
          </Button>
        </Link>
      }
    >
      <BrandStats
        totalBrands={totalBrandsQuery.data?.data?.meta.total_items ?? 0}
        activeBrands={activeBrandsQuery.data?.data?.meta.total_items ?? 0}
        inactiveBrands={inactiveBrandsQuery.data?.data?.meta.total_items ?? 0}
      />

      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search brands" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as BrandStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...BRAND_STATUS_OPTIONS]}
          aria-label="Filter by status"
        />
        <Input
          value={countryOfOrigin}
          onChange={(event) => {
            setPage(1);
            setCountryOfOrigin(event.target.value);
          }}
          placeholder="Filter by country"
          aria-label="Filter by country"
        />
        <Select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          options={BRAND_SORT_OPTIONS}
          aria-label="Sort brands"
        />
        <Select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
          options={[
            { label: "Descending", value: "desc" },
            { label: "Ascending", value: "asc" }
          ]}
          aria-label="Sort direction"
        />
      </FilterPanel>

      <BrandTable
        brands={brandData?.items ?? []}
        loading={brandsQuery.isLoading}
        onActivate={(brand) => activateMutation.mutate(brand.id)}
        onDeactivate={(brand) => deactivateMutation.mutate(brand.id)}
        onDelete={setBrandToDelete}
        emptyAction={
          <Link to="/brands/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Brand
            </Button>
          </Link>
        }
      />

      {brandData ? (
        <Pagination
          page={brandData.meta.page}
          pageSize={brandData.meta.page_size}
          totalItems={brandData.meta.total_items}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
        />
      ) : null}

      <ConfirmationDialog
        open={Boolean(brandToDelete)}
        title="Delete brand"
        message={`Soft delete ${brandToDelete?.brand_name ?? "this brand"}? This preserves history while hiding it from active reads.`}
        confirmLabel="Delete"
        onCancel={() => setBrandToDelete(null)}
        onConfirm={() => brandToDelete && deleteMutation.mutate(brandToDelete.id)}
      />
    </PageLayout>
  );
}
