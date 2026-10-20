import type {InputHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export function Input({className,type,...props}:InputHTMLAttributes<HTMLInputElement>) {
  return <input type={type} className={cn("flex h-11 w-full rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--card))] px-3.5 py-2 text-sm text-[rgb(var(--foreground))] shadow-sm outline-none transition placeholder:text-[rgb(var(--muted-foreground))] focus-visible:border-violet-500 focus-visible:ring-4 focus-visible:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50",className)} {...props}/>;
}