import type {TextareaHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export function Textarea({className,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("flex min-h-24 w-full resize-y rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--card))] px-3.5 py-3 text-sm leading-6 text-[rgb(var(--foreground))] shadow-sm outline-none transition placeholder:text-[rgb(var(--muted-foreground))] focus-visible:border-violet-500 focus-visible:ring-4 focus-visible:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50",className)} {...props}/>;
}