"use client";

import { usePathname } from "next/navigation";

const pages = [
  { prefix: "/dashboard", title: "Dashboard", eyebrow: "Your campus command center" },
  { prefix: "/discover", title: "Discover", eyebrow: "Find classmates who fit your goals" },
  { prefix: "/connections", title: "Connections", eyebrow: "Requests, saved profiles, and conversations" },
  { prefix: "/events", title: "Events", eyebrow: "Plan campus moments with a buddy" },
  { prefix: "/assistant", title: "Communication Helper", eyebrow: "Draft clear university messages" },
  { prefix: "/guides", title: "Guides", eyebrow: "Campus life guidance without the guesswork" },
  { prefix: "/profile", title: "Profile", eyebrow: "Your public student identity" },
  { prefix: "/settings", title: "Settings", eyebrow: "Safety, visibility, and account controls" }
];

export function AppTopbarTitle() {
  const pathname = usePathname();
  const current = pages.find((page) => pathname === page.prefix || pathname.startsWith(`${page.prefix}/`)) ?? pages[0];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{current.eyebrow}</p>
      <h1 className="mt-1 text-xl font-black text-foreground">{current.title}</h1>
    </div>
  );
}
