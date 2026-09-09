import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "focus-ring w-full rounded-xl border border-border bg-[var(--bg-sunken)] px-3 text-sm text-foreground transition placeholder:text-[var(--text-faint)] focus:border-[var(--red)] focus:shadow-[0_0_0_3px_var(--red-soft)] focus:outline-none";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-28 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, "h-10", className)} {...props} />;
}
