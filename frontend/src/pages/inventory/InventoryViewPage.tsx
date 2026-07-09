import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageMinus, PackagePlus, Settings } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { InventoryDetailSections } from "@/components/inventory/InventoryDetailSections";
import { InventoryHistoryTable } from "@/components/inventory/InventoryHistoryTable";
import { InventorySettingsForm } from "@/components/inventory/InventorySettingsForm";
import { StockUpdateForm } from "@/components/inventory/StockUpdateForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import {
  getInventoryById,
  getInventoryHistory,
  stockInInventory,
  stockOutInventory,
  updateInventory
} from "@/services/inventoryService";
import { notify } from "@/services/notificationService";
import type { InventoryOperationPayload } from "@/types/inventory";

type DetailModal = "stock-in" | "stock-out" | "settings" | null;

export default function InventoryViewPage() {
  const { inventoryId } = useParams<{ inventoryId: string }>();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<DetailModal>(null);
  const historyParams = { page: 1, page_size: 20 };

  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.detail(inventoryId ?? ""),
    queryFn: () => getInventoryById(inventoryId ?? ""),
    enabled: Boolean(inventoryId)
  });
  const historyQuery = useQuery({
    queryKey: queryKeys.inventory.history(inventoryId ?? "", historyParams),
    queryFn: () => getInventoryHistory(inventoryId ?? "", historyParams),
    enabled: Boolean(inventoryId)
  });

  const invalidateInventory = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(inventoryId ?? "") });
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.history(inventoryId ?? "", historyParams) });
  };

  const stockInMutation = useMutation({
    mutationFn: (payload: InventoryOperationPayload) => stockInInventory(inventoryId ?? "", payload),
    onSuccess: async () => {
      notify.success("Stock added");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const stockOutMutation = useMutation({
    mutationFn: (payload: InventoryOperationPayload) => stockOutInventory(inventoryId ?? "", payload),
    onSuccess: async () => {
      notify.success("Stock removed");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateInventory>[1]) => updateInventory(inventoryId ?? "", payload),
    onSuccess: async () => {
      notify.success("Inventory settings updated");
      setActiveModal(null);
      await invalidateInventory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (inventoryQuery.isLoading) {
    return <LoadingState label="Loading inventory details" />;
  }

  if (inventoryQuery.isError || !inventoryQuery.data?.data) {
    return <ErrorState title="Inventory not found" message={getApiErrorMessage(inventoryQuery.error)} />;
  }

  const inventory = inventoryQuery.data.data;

  return (
    <PageLayout
      title="Inventory Details"
      description="Review product inventory balances, thresholds, reservations, and transaction history."
      actions={
        <>
          <Button onClick={() => setActiveModal("stock-in")}>
            <PackagePlus className="h-4 w-4" />
            Add Stock
          </Button>
          <Button variant="secondary" onClick={() => setActiveModal("stock-out")}>
            <PackageMinus className="h-4 w-4" />
            Remove Stock
          </Button>
          <Button variant="secondary" onClick={() => setActiveModal("settings")}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </>
      }
    >
      <InventoryDetailSections inventory={inventory} />
      <InventoryHistoryTable transactions={historyQuery.data?.data?.items ?? []} loading={historyQuery.isLoading} />

      <Modal
        open={Boolean(activeModal)}
        title={
          activeModal === "stock-in" ? "Add Stock" : activeModal === "stock-out" ? "Remove Stock" : "Inventory Settings"
        }
        onClose={() => setActiveModal(null)}
      >
        {activeModal === "stock-in" ? (
          <StockUpdateForm mode="stock-in" loading={stockInMutation.isPending} onSubmit={stockInMutation.mutate} />
        ) : null}
        {activeModal === "stock-out" ? (
          <StockUpdateForm
            mode="stock-out"
            maxQuantity={inventory.available_quantity}
            loading={stockOutMutation.isPending}
            onSubmit={stockOutMutation.mutate}
          />
        ) : null}
        {activeModal === "settings" ? (
          <InventorySettingsForm
            inventory={inventory}
            loading={settingsMutation.isPending}
            onSubmit={settingsMutation.mutate}
          />
        ) : null}
      </Modal>
    </PageLayout>
  );
}
