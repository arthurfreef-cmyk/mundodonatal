import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface CheckoutFieldProps extends ComponentProps<"input"> {
  label: string;
}

export function CheckoutField({ label, className, id, ...props }: CheckoutFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-xs font-medium">{label}</label>
      <input id={fieldId} className={cn("h-[52px] w-full min-w-0 rounded-md border border-border bg-background px-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 sm:text-sm", className)} {...props} />
    </div>
  );
}