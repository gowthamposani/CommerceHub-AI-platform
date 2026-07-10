import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PackagePlus, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { InventorySettingsForm } from "@/components/inventory/InventorySettingsForm";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { StockUpdateForm } from "@/components/inventory/StockUpdateForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { queryKeys } from "@/lib/queryKeys";
import { getInventory, stockInInventory, updateInventory } from "@/services/inventoryService";
import { notify } from "@/services/notificationService";
import type { InventoryOperationPayload, InventoryRecord } from "@/types/inventory";
import { formatNumber } from "@/utils/formatters";

type LowStockModal = "restock" | "settings" | null;

export default function InventoryLowStockPage() {
  const queryClient = useQueryClient();
  const [selectedInventory, setSelectedInventory] = useState<InventoryRecord | null>(null);
  const [activeModal, setActiveModal] = useState<LowStockModal>(null);
  const params = {
    page: 1,
    page_size: 100,
    low_stock: true,
    sort_by: "available_quantity",
    sort_direction: "asc" as const
  };

  const lowStockQuery = useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => getInventory(params)
  });

  const invalidateInventory = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
  };

  const restockMutation = useMutation({
    mutationFn: (payload: InventoryOperationPayload) => stockInInventory(selectedInventory?.id ?? "", payload),
    onSuccess: async () => {
      notify.success("Stock added");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateInventory>[1]) =>
      updateInventory(selectedInventory?.id ?? "", payload),
    onSuccess: async () => {
      notify.success("Inventory threshold updated");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (lowStockQuery.isError) {
    return <ErrorState title="Unable to load low stock alerts" message={getApiErrorMessage(lowStockQuery.error)} />;
  }

  const items = lowStockQuery.data?.data?.items ?? [];
  const openModal = (inventory: InventoryRecord, modal: LowStockModal) => {
    setSelectedInventory(inventory);
    setActiveModal(modal);
  };

  return (
    <PageLayout
      title="Low Stock Alerts"
      description="Review products below reorder threshold and trigger restock or threshold updates."
      actions={
        <Link to="/inventory">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Inventory
          </Button>
        </Link>
      }
    >
      {items.length === 0 && !lowStockQuery.isLoading ? (
        <EmptyState title="No Low Stock Products" message="Inventory records below threshold will appear here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const reorderQuantity = Math.max(item.reorder_level - item.available_quantity, 0);
            return (
              <Card key={item.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gray-950">{item.product_name ?? "Product"}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.sku}</p>
                    </div>
                    <InventoryStatusBadge status={item.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Current Quantity" value={formatNumber(item.available_quantity)} />
                    <Metric label="Reorder Level" value={formatNumber(item.reorder_level)} />
                    <Metric label="Required Reorder" value={formatNumber(reorderQuantity)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => openModal(item, "restock")}>
                      <PackagePlus className="h-4 w-4" />
                      Restock
                    </Button>
                    <Button variant="secondary" onClick={() => openModal(item, "settings")}>
                      <Settings className="h-4 w-4" />
                      Update Threshold
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(activeModal && selectedInventory)}
        title={activeModal === "restock" ? "Restock Product" : "Update Low Stock Threshold"}
        onClose={() => setActiveModal(null)}
      >
        {selectedInventory && activeModal === "restock" ? (
          <StockUpdateForm mode="stock-in" loading={restockMutation.isPending} onSubmit={restockMutation.mutate} />
        ) : null}
        {selectedInventory && activeModal === "settings" ? (
          <InventorySettingsForm
            inventory={selectedInventory}
            loading={settingsMutation.isPending}
            onSubmit={settingsMutation.mutate}
          />
        ) : null}
      </Modal>
    </PageLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-950">{value}</p>
    </div>
  );
}
