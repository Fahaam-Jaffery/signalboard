import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "success" | "warning";
const variants:Record<Variant,string>={
  default:"border-transparent bg-violet-600 text-white",
  secondary:"border-transparent bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]",
  outline:"border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
  success:"border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:"border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};
export function Badge({className,variant="secondary",...props}:HTMLAttributes<HTMLSpanElement>&{variant?:Variant}) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",variants[variant],className)} {...props}/>;
}