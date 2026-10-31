import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: "left" | "right";
  children: ReactNode;
}

export function StoreDrawer({ open, onOpenChange, title, side = "right", children }: StoreDrawerProps) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
      <Dialog.Content aria-describedby={undefined} className={cn("fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-background outline-none", side === "left" ? "left-0 max-w-[85%] sm:max-w-md" : "right-0")}>
        <div className="flex items-center justify-between border-b p-5">
          <Dialog.Title className="font-heading text-2xl">{title}</Dialog.Title>
          <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label={`Fechar ${title.toLowerCase()}`}><X /></Button></Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}