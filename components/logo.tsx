import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-md">
      <span className="grid size-9 place-items-center rounded-md bg-navy text-sm font-black text-white">
        UB
      </span>
      <span className="text-xl font-black tracking-normal text-navy">UniBridge</span>
    </Link>
  );
}
