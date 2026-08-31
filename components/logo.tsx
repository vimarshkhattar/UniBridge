import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function Logo({ href = "/", className, compact = false }: LogoProps) {
  return (
    <Link href={href} className={cn("focus-ring inline-flex items-center gap-3 rounded-2xl", className)}>
      <span className="relative grid size-11 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#17070b] text-sm font-black text-white shadow-glow">
        <span className="absolute inset-0 bg-brand-gradient opacity-80" />
        <span className="absolute left-2 top-2 size-1.5 rounded-full bg-white/70" />
        <span className="absolute bottom-2 right-2 size-1.5 rounded-full bg-white/70" />
        <span className="relative">UB</span>
      </span>
      {!compact && <span className="font-display text-xl font-black text-foreground sm:text-2xl">UniBridge</span>}
    </Link>
  );
}
