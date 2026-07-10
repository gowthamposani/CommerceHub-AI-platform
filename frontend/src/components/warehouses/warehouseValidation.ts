import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
  z.number().finite().nullable()
) as z.ZodType<number | null>;

export const warehouseFormSchema = z.object({
  seller_id: z.string().uuid("Seller ID must be a valid UUID"),
  warehouse_code: z
    .string()
    .min(3, "Warehouse code is required")
    .max(50, "Warehouse code must be 50 characters or fewer")
    .regex(/^[A-Z0-9][A-Z0-9_-]{2,49}$/i, "Use letters, numbers, underscores, or hyphens"),
  warehouse_name: z.string().min(2, "Warehouse name is required").max(255),
  contact_person: z.string().min(2, "Contact person is required").max(255),
  phone_number: z.string().regex(/^[+0-9][0-9\s().-]{7,19}$/, "Phone number format is invalid"),
  email: z.string().email("Enter a valid email address"),
  address_line_1: z.string().min(3, "Address line 1 is required").max(255),
  address_line_2: z.string().max(255).nullable(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  country: z.string().min(2, "Country is required").max(100),
  postal_code: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{2,19}$/, "Postal code format is invalid"),
  latitude: optionalNumber.refine((value) => value === null || (value >= -90 && value <= 90), "Latitude is invalid"),
  longitude: optionalNumber.refine(
    (value) => value === null || (value >= -180 && value <= 180),
    "Longitude is invalid"
  ),
  warehouse_type: z.enum(["fulfillment", "storage", "returns", "cross_dock", "dark_store"]),
  status: z.enum(["active", "inactive", "suspended", "deleted"]),
  is_default: z.boolean()
});

export const warehouseTransferSchema = z
  .object({
    source_warehouse_id: z.string().uuid("Select a source warehouse"),
    destination_warehouse_id: z.string().uuid("Select a destination warehouse"),
    inventory_id: z.string().uuid("Select an inventory record"),
    quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
    reference_number: z.string().max(120).nullable(),
    remarks: z.string().max(500).nullable()
  })
  .refine((value) => value.source_warehouse_id !== value.destination_warehouse_id, {
    message: "Source and destination warehouses must be different",
    path: ["destination_warehouse_id"]
  });

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
export type WarehouseTransferValues = z.infer<typeof warehouseTransferSchema>;
