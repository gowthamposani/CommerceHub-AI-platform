import { z } from "zod";

export const inventoryOperationSchema = z.object({
  quantity: z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
  reference_number: z.string().max(120, "Reference cannot exceed 120 characters").optional().nullable(),
  remarks: z.string().max(1000, "Reason cannot exceed 1000 characters").optional().nullable(),
  performed_by: z.string().max(120, "Performed by cannot exceed 120 characters").optional().nullable()
});

export const inventorySettingsSchema = z
  .object({
    minimum_stock: z.coerce.number().int("Minimum stock must be a whole number").min(0),
    maximum_stock: z
      .union([z.coerce.number().int().min(0), z.literal("")])
      .optional()
      .nullable(),
    reorder_level: z.coerce.number().int("Reorder level must be a whole number").min(0),
    transfer_ready: z.boolean()
  })
  .refine(
    (value) => value.maximum_stock === "" || value.maximum_stock == null || value.maximum_stock >= value.minimum_stock,
    {
      path: ["maximum_stock"],
      message: "Maximum stock cannot be lower than minimum stock"
    }
  )
  .refine(
    (value) => value.maximum_stock === "" || value.maximum_stock == null || value.maximum_stock >= value.reorder_level,
    {
      path: ["maximum_stock"],
      message: "Maximum stock cannot be lower than reorder level"
    }
  );

export type InventoryOperationFormValues = z.infer<typeof inventoryOperationSchema>;
export type InventorySettingsFormValues = z.infer<typeof inventorySettingsSchema>;
