import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { Pagination } from "@/components/table/Pagination";
import { SellerTable } from "@/components/sellers/SellerTable";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SELLER_BUSINESS_TYPE_OPTIONS, SELLER_SORT_OPTIONS, SELLER_STATUS_OPTIONS } from "@/constants/seller";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { activateSeller, deactivateSeller, deleteSeller, getSellers } from "@/services/sellerService";
import { notify } from "@/services/notificationService";
import type { Seller, SellerBusinessType, SellerStatus } from "@/types/seller";
import { getApiErrorMessage } from "@/api/errors";

export default function SellerListPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<SellerStatus | "">("");
  const [businessType, setBusinessType] = useState<SellerBusinessType | "">("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: status || undefined,
    business_type: businessType || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection
  };

  const sellersQuery = useQuery({
    queryKey: queryKeys.sellers.list(params),
    queryFn: () => getSellers(params)
  });

  const invalidateSellers = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sellers.all });
  };

  const activateMutation = useMutation({
    mutationFn: activateSeller,
    onSuccess: async () => {
      notify.success("Seller activated");
      await invalidateSellers();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateSeller,
    onSuccess: async () => {
      notify.success("Seller deactivated");
      await invalidateSellers();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeller,
    onSuccess: async () => {
      notify.success("Seller deleted");
      setSellerToDelete(null);
      await invalidateSellers();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (sellersQuery.isError) {
    return <ErrorState title="Unable to load sellers" message={getApiErrorMessage(sellersQuery.error)} />;
  }

  const sellerData = sellersQuery.data?.data;

  return (
    <PageLayout
      title="Seller Management"
      description="Create, review, update, activate, deactivate, and soft delete seller profiles."
      actions={
        <Link to="/sellers/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Seller
          </Button>
        </Link>
      }
    >
      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search sellers" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as SellerStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...SELLER_STATUS_OPTIONS]}
          aria-label="Filter by status"
        />
        <Select
          value={businessType}
          onChange={(event) => {
            setPage(1);
            setBusinessType(event.target.value as SellerBusinessType | "");
          }}
          options={[{ label: "All business types", value: "" }, ...SELLER_BUSINESS_TYPE_OPTIONS]}
          aria-label="Filter by business type"
        />
        <Select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          options={SELLER_SORT_OPTIONS}
          aria-label="Sort sellers"
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

      <SellerTable
        sellers={sellerData?.items ?? []}
        loading={sellersQuery.isLoading}
        onActivate={(seller) => activateMutation.mutate(seller.id)}
        onDeactivate={(seller) => deactivateMutation.mutate(seller.id)}
        onDelete={setSellerToDelete}
        emptyAction={
          <Link to="/sellers/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Seller
            </Button>
          </Link>
        }
      />

      {sellerData ? (
        <Pagination
          page={sellerData.meta.page}
          pageSize={sellerData.meta.page_size}
          totalItems={sellerData.meta.total_items}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
        />
      ) : null}

      <ConfirmationDialog
        open={Boolean(sellerToDelete)}
        title="Delete seller"
        message={`Soft delete ${sellerToDelete?.business_name ?? "this seller"}? This can be restored by backend policy later.`}
        confirmLabel="Delete"
        onCancel={() => setSellerToDelete(null)}
        onConfirm={() => sellerToDelete && deleteMutation.mutate(sellerToDelete.id)}
      />
    </PageLayout>
  );
}
