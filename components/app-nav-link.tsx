"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { BookOpen, CalendarDays, Compass, LayoutDashboard, Settings, Sparkles, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppNavIconName =
  | "dashboard"
  | "discover"
  | "connections"
  | "events"
  | "assistant"
  | "guides"
  | "profile"
  | "settings";

const icons: Record<AppNavIconName, ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  discover: Compass,
  connections: UsersRound,
  events: CalendarDays,
  assistant: Sparkles,
  guides: BookOpen,
  profile: UserRound,
  settings: Settings
};

type AppNavLinkProps = {
  href: string;
  label: string;
  mobileLabel?: string;
  iconName: AppNavIconName;
  mobile?: boolean;
};

export function AppNavLink({ href, label, mobileLabel, iconName, mobile = false }: AppNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  const Icon = icons[iconName];

  if (mobile) {
    return (
      <Link
        href={href}
        className={cn(
          "focus-ring nav-3d flex min-w-[5.8rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold",
          active
            ? "bg-[var(--red-soft)] text-white shadow-[0_12px_30px_-20px_var(--red-glow)]"
            : "text-muted-foreground hover:bg-white/[0.06] hover:text-white"
        )}
      >
        <Icon className="size-5" aria-hidden />
        <span className="max-w-[4.8rem] truncate">{mobileLabel ?? label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "focus-ring nav-3d group relative flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-bold",
        active
          ? "border-[rgba(225,29,46,0.3)] bg-[var(--red-soft)] text-white shadow-[0_18px_42px_-30px_var(--red-glow)]"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-white/[0.05] hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl transition",
          active ? "bg-brand-gradient text-white" : "bg-white/[0.045] text-muted-foreground group-hover:text-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span>{label}</span>
      {active && <span className="absolute right-3 size-1.5 rounded-full bg-accent shadow-glow" aria-hidden />}
    </Link>
  );
}
