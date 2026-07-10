import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { InventoryCharts } from "@/components/inventory/InventoryCharts";
import { InventoryDashboardCards } from "@/components/inventory/InventoryDashboardCards";
import { InventorySettingsForm } from "@/components/inventory/InventorySettingsForm";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { StockUpdateForm } from "@/components/inventory/StockUpdateForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { Modal } from "@/components/modals/Modal";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { INVENTORY_SORT_OPTIONS, INVENTORY_STATUS_OPTIONS } from "@/constants/inventory";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import {
  deleteInventory,
  getInventory,
  stockInInventory,
  stockOutInventory,
  updateInventory
} from "@/services/inventoryService";
import { notify } from "@/services/notificationService";
import type {
  InventoryDashboardMetrics,
  InventoryOperationPayload,
  InventoryRecord,
  InventoryStatus
} from "@/types/inventory";

type InventoryModal = "stock-in" | "stock-out" | "settings" | null;

export default function InventoryListPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<InventoryStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedInventory, setSelectedInventory] = useState<InventoryRecord | null>(null);
  const [activeModal, setActiveModal] = useState<InventoryModal>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryRecord | null>(null);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    status: status || undefined,
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection
  };

  const dashboardParams = { page: 1, page_size: 100, sort_by: "newest", sort_direction: "desc" as const };

  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => getInventory(params)
  });
  const dashboardQuery = useQuery({
    queryKey: queryKeys.inventory.metrics("dashboard"),
    queryFn: () => getInventory(dashboardParams)
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getCategories({ page: 1, page_size: 100, status: "active" })
  });
  const brandsQuery = useQuery({
    queryKey: queryKeys.brands.list({ page: 1, page_size: 100, status: "active" }),
    queryFn: () => getBrands({ page: 1, page_size: 100, status: "active" })
  });

  const invalidateInventory = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
  };

  const stockInMutation = useMutation({
    mutationFn: (payload: InventoryOperationPayload) => stockInInventory(selectedInventory?.id ?? "", payload),
    onSuccess: async () => {
      notify.success("Stock added");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const stockOutMutation = useMutation({
    mutationFn: (payload: InventoryOperationPayload) => stockOutInventory(selectedInventory?.id ?? "", payload),
    onSuccess: async () => {
      notify.success("Stock removed");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateInventory>[1]) =>
      updateInventory(selectedInventory?.id ?? "", payload),
    onSuccess: async () => {
      notify.success("Inventory settings updated");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: (inventory: InventoryRecord) => deleteInventory(inventory.id),
    onSuccess: async () => {
      notify.success("Inventory record deleted");
      setDeleteTarget(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const inventoryData = inventoryQuery.data?.data;
  const dashboardData = dashboardQuery.data?.data;
  const dashboardItems = useMemo(() => dashboardData?.items ?? [], [dashboardData?.items]);
  const filteredItems = useMemo(() => {
    const items = inventoryData?.items ?? [];
    return items.filter((item) => {
      const updated = new Date(item.updated_at).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : null;
      const to = dateTo ? new Date(dateTo).getTime() : null;
      return (!from || updated >= from) && (!to || updated <= to + 86_399_999);
    });
  }, [dateFrom, dateTo, inventoryData?.items]);

  const metrics = useMemo<InventoryDashboardMetrics>(() => {
    const valueItems = dashboardItems.filter((item) => item.unit_price != null);
    return {
      totalProducts: dashboardData?.meta.total_items ?? 0,
      totalStockUnits: dashboardItems.reduce((sum, item) => sum + item.available_quantity + item.reserved_quantity, 0),
      lowStockProducts: dashboardItems.filter((item) => item.status === "low_stock").length,
      outOfStockProducts: dashboardItems.filter((item) => item.status === "out_of_stock").length,
      inventoryValue:
        valueItems.length === 0
          ? null
          : valueItems.reduce((sum, item) => sum + item.available_quantity * Number(item.unit_price ?? 0), 0)
    };
  }, [dashboardData?.meta.total_items, dashboardItems]);

  if (inventoryQuery.isError) {
    return <ErrorState title="Unable to load inventory" message={getApiErrorMessage(inventoryQuery.error)} />;
  }

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

  const openModal = (inventory: InventoryRecord, modal: InventoryModal) => {
    setSelectedInventory(inventory);
    setActiveModal(modal);
  };

  return (
    <PageLayout
      title="Inventory Management"
      description="Monitor product stock, reservations, low-stock alerts, and seller inventory movement."
      actions={
        <Link to="/inventory/low-stock">
          <Button variant="secondary">
            <AlertTriangle className="h-4 w-4" />
            Low Stock Alerts
          </Button>
        </Link>
      }
    >
      <InventoryDashboardCards metrics={metrics} />
      <InventoryCharts inventory={dashboardItems} />

      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search product, SKU, category, or brand" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as InventoryStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...INVENTORY_STATUS_OPTIONS]}
          aria-label="Filter by stock status"
        />
        <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} options={categoryOptions} />
        <Select value={brandId} onChange={(event) => setBrandId(event.target.value)} options={brandOptions} />
        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          aria-label="Date from"
        />
        <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Date to" />
        <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} options={INVENTORY_SORT_OPTIONS} />
        <Select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
          options={[
            { label: "Descending", value: "desc" },
            { label: "Ascending", value: "asc" }
          ]}
        />
      </FilterPanel>

      <InventoryTable
        inventory={filteredItems}
        loading={inventoryQuery.isLoading}
        onStockIn={(inventory) => openModal(inventory, "stock-in")}
        onStockOut={(inventory) => openModal(inventory, "stock-out")}
        onSettings={(inventory) => openModal(inventory, "settings")}
        onDelete={setDeleteTarget}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={inventoryData?.meta.total_items ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        }}
      />

      <Modal
        open={Boolean(activeModal && selectedInventory)}
        title={
          activeModal === "stock-in" ? "Add Stock" : activeModal === "stock-out" ? "Remove Stock" : "Inventory Settings"
        }
        onClose={() => setActiveModal(null)}
      >
        {selectedInventory && activeModal === "stock-in" ? (
          <StockUpdateForm mode="stock-in" loading={stockInMutation.isPending} onSubmit={stockInMutation.mutate} />
        ) : null}
        {selectedInventory && activeModal === "stock-out" ? (
          <StockUpdateForm
            mode="stock-out"
            maxQuantity={selectedInventory.available_quantity}
            loading={stockOutMutation.isPending}
            onSubmit={stockOutMutation.mutate}
          />
        ) : null}
        {selectedInventory && activeModal === "settings" ? (
          <InventorySettingsForm
            inventory={selectedInventory}
            loading={settingsMutation.isPending}
            onSubmit={settingsMutation.mutate}
          />
        ) : null}
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete inventory record"
        message="This will soft delete the inventory record. Transaction history remains available in the backend."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </PageLayout>
  );
}
