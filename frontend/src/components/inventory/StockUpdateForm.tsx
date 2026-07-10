import { useForm } from "react-hook-form";

import {
  inventoryOperationSchema,
  type InventoryOperationFormValues
} from "@/components/inventory/inventoryValidation";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { InventoryOperationPayload } from "@/types/inventory";

export function StockUpdateForm({
  mode,
  loading,
  maxQuantity,
  onSubmit
}: {
  mode: "stock-in" | "stock-out";
  loading?: boolean;
  maxQuantity?: number;
  onSubmit: (payload: InventoryOperationPayload) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InventoryOperationFormValues>({
    resolver: zodFormResolver(inventoryOperationSchema),
    defaultValues: {
      quantity: 1,
      reference_number: "",
      remarks: "",
      performed_by: ""
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Quantity" error={errors.quantity?.message}>
        <Input type="number" min={1} max={maxQuantity} {...register("quantity")} />
      </FormField>
      <FormField label="Supplier / Reference" error={errors.reference_number?.message}>
        <Input {...register("reference_number")} placeholder="Reference number" />
      </FormField>
      <FormField label="Reason" error={errors.remarks?.message}>
        <Textarea
          {...register("remarks")}
          placeholder={mode === "stock-in" ? "Supplier receipt" : "Manual stock removal"}
        />
      </FormField>
      <FormField label="Performed By" error={errors.performed_by?.message}>
        <Input {...register("performed_by")} placeholder="Seller operations" />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "stock-in" ? "Add Stock" : "Remove Stock"}
        </Button>
      </div>
    </form>
  );
}
