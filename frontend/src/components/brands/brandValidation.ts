import { z } from "zod";

const currentYear = new Date().getFullYear();

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal(""), z.null()]).transform((value) => (value === "" ? null : value));

const optionalUrl = z
  .union([z.string().trim().url("Enter a valid URL"), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

const optionalCountry = z
  .union([
    z
      .string()
      .trim()
      .regex(/^[A-Za-z][A-Za-z\s.'-]{1,99}$/, "Enter a valid country name"),
    z.literal(""),
    z.null()
  ])
  .transform((value) => (value === "" ? null : value));

export const brandFormSchema = z.object({
  brand_name: z.string().trim().min(2, "Brand name is required").max(255),
  brand_slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(255)
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  description: nullableText(2000),
  logo_url: optionalUrl,
  website: optionalUrl,
  country_of_origin: optionalCountry,
  founded_year: z.number().int().min(1800).max(currentYear).nullable()
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
