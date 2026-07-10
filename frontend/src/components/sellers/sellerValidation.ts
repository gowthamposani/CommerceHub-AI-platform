import { z } from "zod";

const optionalUrl = z
  .union([z.string().trim().url("Enter a valid URL"), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

export const sellerFormSchema = z.object({
  user_id: z.string().uuid("Enter a valid user UUID"),
  business_name: z.string().trim().min(2, "Business name is required").max(255),
  legal_business_name: z.string().trim().max(255).nullable(),
  business_type: z.enum(["individual", "proprietorship", "partnership", "private_limited", "llp", "other"]),
  business_email: z.string().trim().email("Enter a valid business email"),
  business_phone: z.string().regex(/^[+]?[0-9][0-9\s()-]{7,19}$/, "Enter a valid phone number"),
  gst_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid GST number"),
  pan_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN number"),
  tax_identification_number: z.string().trim().max(50).nullable(),
  website: optionalUrl,
  logo_url: optionalUrl,
  description: z.string().trim().max(2000).nullable(),
  address_line_1: z.string().trim().min(3, "Address line 1 is required").max(255),
  address_line_2: z.string().trim().max(255).nullable(),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  country: z.string().trim().min(2, "Country is required").max(100),
  postal_code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{2,19}$/, "Enter a valid postal code"),
  account_holder_name: z.string().trim().min(2, "Account holder name is required").max(255),
  bank_name: z.string().trim().min(2, "Bank name is required").max(255),
  account_number: z
    .string()
    .trim()
    .regex(/^[0-9]{6,34}$/, "Account number must contain 6 to 34 digits"),
  ifsc_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  branch_name: z.string().trim().max(255).nullable(),
  default_currency: z.string().trim().length(3, "Currency must be a 3-letter code").toUpperCase(),
  notifications_enabled: z.boolean(),
  order_auto_accept_enabled: z.boolean()
});

export type SellerFormValues = z.infer<typeof sellerFormSchema>;
