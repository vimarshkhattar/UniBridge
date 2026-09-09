import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring press-3d inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-to-b from-[var(--red-bright)] to-[var(--red)] text-white shadow-[0_6px_20px_-6px_var(--red-glow),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_30px_-8px_var(--red-glow),inset_0_1px_0_rgba(255,255,255,0.28)]",
        variant === "secondary" &&
          "border border-border bg-white/[0.05] text-foreground hover:border-[rgba(255,59,71,0.4)] hover:bg-white/[0.09]",
        variant === "ghost" && "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
        variant === "danger" && "bg-[var(--red-deep)] text-white hover:bg-[var(--red)]",
        className
      )}
      {...props}
    />
  );
}
