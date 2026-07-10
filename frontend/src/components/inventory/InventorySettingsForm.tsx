import { useForm } from "react-hook-form";

import { inventorySettingsSchema, type InventorySettingsFormValues } from "@/components/inventory/inventoryValidation";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import type { InventoryRecord, InventoryUpdatePayload } from "@/types/inventory";

export function InventorySettingsForm({
  inventory,
  loading,
  onSubmit
}: {
  inventory: InventoryRecord;
  loading?: boolean;
  onSubmit: (payload: InventoryUpdatePayload) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InventorySettingsFormValues>({
    resolver: zodFormResolver(inventorySettingsSchema),
    defaultValues: {
      minimum_stock: inventory.minimum_stock,
      maximum_stock: inventory.maximum_stock ?? "",
      reorder_level: inventory.reorder_level,
      transfer_ready: inventory.transfer_ready
    }
  });

  const submit = (values: InventorySettingsFormValues) => {
    onSubmit({
      minimum_stock: values.minimum_stock,
      maximum_stock: values.maximum_stock === "" ? null : Number(values.maximum_stock),
      reorder_level: values.reorder_level,
      transfer_ready: values.transfer_ready
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <FormField label="Minimum Stock" error={errors.minimum_stock?.message}>
        <Input type="number" min={0} {...register("minimum_stock")} />
      </FormField>
      <FormField label="Maximum Stock" error={errors.maximum_stock?.message}>
        <Input type="number" min={0} {...register("maximum_stock")} />
      </FormField>
      <FormField label="Reorder Level" error={errors.reorder_level?.message}>
        <Input type="number" min={0} {...register("reorder_level")} />
      </FormField>
      <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800">
        <Checkbox {...register("transfer_ready")} />
        Transfer Ready
      </label>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}
