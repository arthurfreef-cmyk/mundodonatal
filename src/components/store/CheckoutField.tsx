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
      <input id={fieldId} className={cn("h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30", className)} {...props} />
    </div>
  );
}