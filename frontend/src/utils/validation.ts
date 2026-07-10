import { z } from "zod";

import { EMAIL_REGEX, PHONE_REGEX } from "@/utils/regex";

export const emailSchema = z.string().regex(EMAIL_REGEX, "Enter a valid email address");
export const phoneSchema = z.string().regex(PHONE_REGEX, "Enter a valid phone number");
export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);
