import { forwardRef, type SelectHTMLAttributes } from "react";

import type { Option } from "@/types/common";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: readonly Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20",
          className
        )}
        {...props}
      >
        {children}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
