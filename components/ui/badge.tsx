import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(225,29,46,0.32)] bg-[var(--red-soft)] px-2.5 py-1 text-xs font-semibold text-[#ffc9cd]",
        className
      )}
      {...props}
    />
  );
}
