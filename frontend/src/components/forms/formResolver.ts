import type { FieldErrors, FieldValues, Resolver, ResolverError, ResolverSuccess } from "react-hook-form";
import type { z } from "zod";

export function zodFormResolver<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} } satisfies ResolverSuccess<T>;
    }

    return {
      values: {},
      errors: result.error.issues.reduce<Record<string, { type: string; message: string }>>((errors, issue) => {
        const path = issue.path.join(".");
        errors[path] = { type: issue.code, message: issue.message };
        return errors;
      }, {}) as FieldErrors<T>
    } satisfies ResolverError<T>;
  };
}
