import { z } from "zod";

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal(""), z.null()]).transform((value) => (value === "" ? null : value));

const optionalUrl = z
  .union([z.string().trim().url("Enter a valid image URL"), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

const optionalParent = z
  .union([z.string().uuid("Select a valid parent category"), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

export const categoryFormSchema = z.object({
  parent_category_id: optionalParent,
  category_name: z.string().trim().min(2, "Category name is required").max(255),
  category_slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(255)
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  description: nullableText(2000),
  image_url: optionalUrl,
  display_order: z.coerce
    .number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
