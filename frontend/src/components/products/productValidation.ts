import { z } from "zod";

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal(""), z.null()]).transform((value) => (value === "" ? null : value));

const nullableDecimal = (label: string, maxDecimals = 2) =>
  z
    .union([z.string().trim(), z.literal(""), z.null()])
    .transform((value) => {
      if (value === "" || value === null) return null;
      return value;
    })
    .refine((value) => value === null || !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => value === null || Number(value) >= 0, `${label} cannot be negative`)
    .refine(
      (value) => value === null || new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimals}})?$`).test(value),
      `${label} supports up to ${maxDecimals} decimal places`
    );

const requiredDecimal = (label: string, maxDecimals = 2) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => Number(value) >= 0, `${label} cannot be negative`)
    .refine(
      (value) => new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimals}})?$`).test(value),
      `${label} supports up to ${maxDecimals} decimal places`
    );

export const productFormSchema = z
  .object({
    seller_id: z.string().uuid("Select a seller"),
    category_id: z.string().uuid("Select a category"),
    brand_id: z.string().uuid("Select a brand"),
    product_name: z.string().trim().min(2, "Product name is required").max(255),
    product_slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .max(255)
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
    short_description: nullableText(500),
    long_description: nullableText(5000),
    sku: z
      .string()
      .trim()
      .min(2, "SKU is required")
      .max(100)
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9._-]{1,99}$/, "Use uppercase letters, numbers, dots, underscores, or hyphens"),
    barcode: z
      .union([
        z
          .string()
          .trim()
          .regex(/^[A-Za-z0-9._-]{3,100}$/, "Use letters, numbers, dots, underscores, or hyphens"),
        z.literal(""),
        z.null()
      ])
      .transform((value) => (value === "" ? null : value)),
    price: requiredDecimal("Price"),
    discount_price: nullableDecimal("Discount price"),
    cost_price: nullableDecimal("Cost price"),
    currency: z.string().trim().length(3, "Currency must be a three-letter code").toUpperCase(),
    tax_percentage: requiredDecimal("Tax percentage").refine(
      (value) => Number(value) <= 100,
      "Tax percentage must be between 0 and 100"
    ),
    weight: nullableDecimal("Weight", 3),
    length: nullableDecimal("Length", 3),
    width: nullableDecimal("Width", 3),
    height: nullableDecimal("Height", 3),
    visibility: z.enum(["public", "private", "hidden"]),
    is_featured: z.boolean()
  })
  .refine((values) => values.discount_price === null || Number(values.discount_price) <= Number(values.price), {
    message: "Discount price cannot be greater than price",
    path: ["discount_price"]
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
