"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type {HTMLAttributes, ComponentPropsWithoutRef} from "react";
import {X} from "lucide-react";
import {cn} from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({className,...props}:ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",className)} {...props}/>;
}

export function DialogContent({className,children,...props}:ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return <DialogPortal>
    <DialogOverlay/>
    <DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 text-[rgb(var(--foreground))] shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:p-7",className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--muted-foreground))] transition hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20 disabled:pointer-events-none" aria-label="Close dialog">
        <X size={16}/>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>;
}

export function DialogHeader({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 text-left",className)} {...props}/>;
}
export function DialogTitle({className,...props}:ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight",className)} {...props}/>;
}
export function DialogDescription({className,...props}:ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm leading-6 text-[rgb(var(--muted-foreground))]",className)} {...props}/>;
}
export function DialogFooter({className,...props}:HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",className)} {...props}/>;
}