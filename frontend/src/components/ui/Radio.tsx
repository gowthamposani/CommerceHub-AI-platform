import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="radio"
      className={cn("h-4 w-4 border-gray-300 text-brand-gold focus:ring-brand-gold", className)}
      {...props}
    />
  );
});

Radio.displayName = "Radio";
