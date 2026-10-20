import type {ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

const variants: Record<ButtonVariant, string> = {
  default: "bg-violet-600 text-white shadow-sm hover:bg-violet-500 active:bg-violet-700",
  secondary: "bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:brightness-[.98] dark:hover:brightness-110",
  outline: "border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))]",
  ghost: "hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
  destructive: "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:brightness-95",
  link: "text-violet-600 underline-offset-4 hover:underline dark:text-violet-300",
};
const sizes: Record<ButtonSize, string> = {
  default: "min-h-10 px-4 py-2.5 text-sm",
  sm: "min-h-8 rounded-lg px-3 py-1.5 text-xs",
  lg: "min-h-12 rounded-xl px-6 py-3 text-sm",
  icon: "h-10 w-10 p-0",
};

export function Button({className, variant="default", size="default", type="button", ...props}: Props) {
  return <button type={type} className={cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props}/>;
}