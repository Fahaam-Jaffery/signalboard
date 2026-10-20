import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export function Separator({className,orientation="horizontal",decorative=true,...props}:HTMLAttributes<HTMLDivElement>&{orientation?:"horizontal"|"vertical";decorative?:boolean}) {
  return <div role={decorative?"none":"separator"} aria-orientation={decorative?undefined:orientation} className={cn("shrink-0 bg-[rgb(var(--border))]",orientation==="horizontal"?"h-px w-full":"h-full w-px",className)} {...props}/>;
}