import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800",
        className
      )}
      {...props}
    />
  );
}
