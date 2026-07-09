import { useForm } from "react-hook-form";

import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { warehouseTransferSchema, type WarehouseTransferValues } from "@/components/warehouses/warehouseValidation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { InventoryRecord } from "@/types/inventory";
import type { Warehouse } from "@/types/warehouse";

export function WarehouseTransferDialog({
  warehouses,
  inventory,
  loading,
  backendAvailable,
  onSubmit
}: {
  warehouses: Warehouse[];
  inventory: InventoryRecord[];
  loading?: boolean;
  backendAvailable: boolean;
  onSubmit: (values: WarehouseTransferValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WarehouseTransferValues>({
    resolver: zodFormResolver(warehouseTransferSchema),
    defaultValues: {
      source_warehouse_id: "",
      destination_warehouse_id: "",
      inventory_id: "",
      quantity: 1,
      reference_number: null,
      remarks: null
    }
  });

  const warehouseOptions = [
    { label: "Select warehouse", value: "" },
    ...warehouses.map((warehouse) => ({
      label: `${warehouse.warehouse_code} - ${warehouse.warehouse_name}`,
      value: warehouse.id
    }))
  ];
  const inventoryOptions = [
    { label: "Select product inventory", value: "" },
    ...inventory.map((item) => ({ label: `${item.sku} - ${item.product_name ?? "Product"}`, value: item.id }))
  ];

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {!backendAvailable ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm font-semibold text-yellow-900">
          Transfer workflow is ready in the UI, but the backend transfer endpoint is not available yet.
        </div>
      ) : null}
      <FormField label="Source Warehouse" error={errors.source_warehouse_id?.message}>
        <Select {...register("source_warehouse_id")} options={warehouseOptions} />
      </FormField>
      <FormField label="Destination Warehouse" error={errors.destination_warehouse_id?.message}>
        <Select {...register("destination_warehouse_id")} options={warehouseOptions} />
      </FormField>
      <FormField label="Product Selection" error={errors.inventory_id?.message}>
        <Select {...register("inventory_id")} options={inventoryOptions} />
      </FormField>
      <FormField label="Quantity" error={errors.quantity?.message}>
        <Input type="number" min={1} {...register("quantity")} />
      </FormField>
      <FormField label="Supplier / Reference" error={errors.reference_number?.message}>
        <Input {...register("reference_number")} />
      </FormField>
      <FormField label="Reason" error={errors.remarks?.message}>
        <Textarea {...register("remarks")} />
      </FormField>
      <FormActions>
        <Button type="submit" loading={loading} disabled={!backendAvailable}>
          Confirm Transfer
        </Button>
      </FormActions>
    </form>
  );
}
