import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { Pagination } from "@/components/table/Pagination";
import { Select } from "@/components/ui/Select";
import { WarehouseInventoryTable } from "@/components/warehouses/WarehouseInventoryTable";
import { INVENTORY_STATUS_OPTIONS } from "@/constants/inventory";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { getWarehouseById, getWarehouseInventory } from "@/services/warehouseService";
import type { InventoryStatus } from "@/types/inventory";

export default function WarehouseInventoryPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<InventoryStatus | "">("");
  const warehouseQuery = useQuery({
    queryKey: queryKeys.warehouses.detail(warehouseId ?? ""),
    queryFn: () => getWarehouseById(warehouseId ?? ""),
    enabled: Boolean(warehouseId)
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.warehouses.inventory(warehouseId ?? "", { page, page_size: pageSize }),
    queryFn: () => getWarehouseInventory(warehouseId ?? "", { page, page_size: pageSize }),
    enabled: Boolean(warehouseId)
  });

  if (warehouseQuery.isLoading) return <LoadingState label="Loading warehouse inventory" />;
  if (warehouseQuery.isError || !warehouseQuery.data?.data) {
    return <ErrorState title="Warehouse not found" message={getApiErrorMessage(warehouseQuery.error)} />;
  }

  const filteredItems = (inventoryQuery.data?.data?.items ?? []).filter((item) => {
    const matchesSearch =
      !debouncedSearch ||
      item.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (item.product_name ?? "").toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout
      title="Warehouse Inventory"
      description={`Products and inventory balances stored in ${warehouseQuery.data.data.warehouse_name}.`}
    >
      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search warehouse inventory" />
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as InventoryStatus | "")}
          options={[{ label: "All statuses", value: "" }, ...INVENTORY_STATUS_OPTIONS]}
        />
      </FilterPanel>
      <WarehouseInventoryTable inventory={filteredItems} loading={inventoryQuery.isLoading} />
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={inventoryQuery.data?.data?.meta.total_items ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        }}
      />
    </PageLayout>
  );
}
