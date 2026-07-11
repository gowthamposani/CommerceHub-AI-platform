import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { Modal } from "@/components/modals/Modal";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { WarehouseCharts } from "@/components/warehouses/WarehouseCharts";
import { WarehouseDashboardCards } from "@/components/warehouses/WarehouseDashboardCards";
import { WarehouseTable } from "@/components/warehouses/WarehouseTable";
import { WarehouseTransferDialog } from "@/components/warehouses/WarehouseTransferDialog";
import { WAREHOUSE_SORT_OPTIONS, WAREHOUSE_STATUS_OPTIONS, WAREHOUSE_TYPE_OPTIONS } from "@/constants/warehouse";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { getInventory } from "@/services/inventoryService";
import { notify } from "@/services/notificationService";
import {
  deleteWarehouse,
  getWarehouseCapacity,
  getWarehouses,
  getWarehouseStatistics,
  setDefaultWarehouse,
  transferWarehouseInventory
} from "@/services/warehouseService";
import type {
  Warehouse,
  WarehouseCapacity,
  WarehouseDashboardMetrics,
  WarehouseStatus,
  WarehouseType
} from "@/types/warehouse";

export default function WarehouseListPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<WarehouseStatus | "">("");
  const [warehouseType, setWarehouseType] = useState<WarehouseType | "">("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: status || undefined,
    warehouse_type: warehouseType || undefined,
    country: country || undefined,
    state: state || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection
  };
  const dashboardParams = { page: 1, page_size: 100, sort_by: "newest", sort_direction: "desc" as const };

  const warehousesQuery = useQuery({
    queryKey: queryKeys.warehouses.list(params),
    queryFn: () => getWarehouses(params)
  });
  const dashboardQuery = useQuery({
    queryKey: queryKeys.warehouses.list(dashboardParams),
    queryFn: () => getWarehouses(dashboardParams)
  });
  const statisticsQuery = useQuery({
    queryKey: queryKeys.warehouses.statistics(),
    queryFn: () => getWarehouseStatistics()
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.list({ page: 1, page_size: 100 }),
    queryFn: () => getInventory({ page: 1, page_size: 100 })
  });

  const warehouses = warehousesQuery.data?.data?.items ?? [];
  const dashboardWarehouses = useMemo(() => dashboardQuery.data?.data?.items ?? [], [dashboardQuery.data?.data?.items]);
  const capacityQueries = useQueries({
    queries: dashboardWarehouses.slice(0, 12).map((warehouse) => ({
      queryKey: queryKeys.warehouses.capacity(warehouse.id),
      queryFn: () => getWarehouseCapacity(warehouse.id)
    }))
  });
  const capacities = capacityQueries
    .map((query) => query.data?.data)
    .filter((capacity): capacity is WarehouseCapacity => Boolean(capacity));

  const metrics = useMemo<WarehouseDashboardMetrics>(() => {
    const stats = statisticsQuery.data?.data;
    const capacityUsed = capacities.reduce((sum, capacity) => sum + (capacity?.utilized_units ?? 0), 0);
    const capacityRemainingValues = capacities
      .map((capacity) => capacity?.available_capacity_units)
      .filter((value): value is number => typeof value === "number");
    return {
      totalWarehouses: stats?.total_warehouses ?? 0,
      activeWarehouses: stats?.active_warehouses ?? 0,
      disabledWarehouses: stats?.inactive_warehouses ?? 0,
      defaultWarehouse: stats?.default_warehouses ?? 0,
      totalInventory: stats?.inventory_records ?? 0,
      capacityUsed,
      capacityRemaining:
        capacityRemainingValues.length > 0 ? capacityRemainingValues.reduce((sum, value) => sum + value, 0) : null
    };
  }, [capacities, statisticsQuery.data?.data]);

  const invalidateWarehouses = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
  };

  const deleteMutation = useMutation({
    mutationFn: (warehouse: Warehouse) => deleteWarehouse(warehouse.id),
    onSuccess: async () => {
      notify.success("Warehouse deleted");
      setDeleteTarget(null);
      await invalidateWarehouses();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });
  const defaultMutation = useMutation({
    mutationFn: (warehouse: Warehouse) => setDefaultWarehouse(warehouse.id),
    onSuccess: async () => {
      notify.success("Default warehouse updated");
      await invalidateWarehouses();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });
  const transferMutation = useMutation({
    mutationFn: transferWarehouseInventory,
    onSuccess: async () => {
      notify.success("Inventory transfer completed");
      setTransferOpen(false);
      await invalidateWarehouses();
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (warehousesQuery.isError) {
    return <ErrorState title="Unable to load warehouses" message={getApiErrorMessage(warehousesQuery.error)} />;
  }

  return (
    <PageLayout
      title="Warehouse Management"
      description="Manage seller warehouse locations, inventory distribution, capacity, and operational readiness."
      actions={
        <>
          <Button variant="secondary" onClick={() => setTransferOpen(true)}>
            <Shuffle className="h-4 w-4" />
            Transfer Inventory
          </Button>
          <Link to="/warehouses/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Warehouse
            </Button>
          </Link>
        </>
      }
    >
      <WarehouseDashboardCards metrics={metrics} />
      <WarehouseCharts warehouses={dashboardWarehouses} capacities={capacities} />

      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search warehouses" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as WarehouseStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...WAREHOUSE_STATUS_OPTIONS]}
          aria-label="Filter by status"
        />
        <Select
          value={warehouseType}
          onChange={(event) => setWarehouseType(event.target.value as WarehouseType | "")}
          options={[{ label: "All types", value: "" }, ...WAREHOUSE_TYPE_OPTIONS]}
          aria-label="Filter by warehouse type"
        />
        <Input value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Filter by country" />
        <Input value={state} onChange={(event) => setState(event.target.value)} aria-label="Filter by state" />
        <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} options={WAREHOUSE_SORT_OPTIONS} />
        <Select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
          options={[
            { label: "Descending", value: "desc" },
            { label: "Ascending", value: "asc" }
          ]}
        />
      </FilterPanel>

      <WarehouseTable
        warehouses={warehouses}
        capacities={capacities}
        loading={warehousesQuery.isLoading}
        onSetDefault={(warehouse) => defaultMutation.mutate(warehouse)}
        onDelete={setDeleteTarget}
        onRefresh={() => void warehousesQuery.refetch()}
        onExport={() => notify.info("Export uses the current live table view")}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={warehousesQuery.data?.data?.meta.total_items ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        }}
      />

      <Modal open={transferOpen} title="Inventory Transfer" onClose={() => setTransferOpen(false)}>
        <WarehouseTransferDialog
          warehouses={dashboardWarehouses}
          inventory={inventoryQuery.data?.data?.items ?? []}
          loading={transferMutation.isPending}
          backendAvailable
          onSubmit={transferMutation.mutate}
        />
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete warehouse"
        message="This warehouse can be deleted only when no blocking inventory exists or inventory has been transferred."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </PageLayout>
  );
}
