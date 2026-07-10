import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn("h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold", className)}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
