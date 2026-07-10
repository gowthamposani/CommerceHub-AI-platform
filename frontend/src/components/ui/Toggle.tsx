import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function Toggle({ checked, className, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-brand-gold" : "bg-gray-300", className)}
      {...props}
    >
      <span
        className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-6" : "left-1")}
      />
    </button>
  );
}
