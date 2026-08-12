import Link from "next/link";
import { BookOpen, Bot, CalendarDays, Compass, LayoutDashboard, MessageCircle, Settings, UserRound, UsersRound } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { NotificationMenu } from "@/components/notification-menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", mobileLabel: "Discover", icon: Compass },
  { href: "/events", label: "Events", mobileLabel: "Events", icon: CalendarDays },
  { href: "/assistant", label: "Communication Helper", mobileLabel: "Helper", icon: Bot },
  { href: "/guides", label: "Guides", mobileLabel: "Guides", icon: BookOpen },
  { href: "/connections", label: "Connections", mobileLabel: "Connections", icon: UsersRound },
  { href: "/profile", label: "Profile", mobileLabel: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-white p-5 lg:block">
        <Logo href="/dashboard" />
        <nav className="mt-8 grid gap-1" aria-label="Application navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-navy"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div className="lg:hidden"><Logo href="/" /></div>
            <p className="hidden text-sm font-medium text-muted-foreground lg:block">International student connection and adjustment platform</p>
            <div className="flex items-center gap-2">
              <NotificationMenu />
              <form action={signOutAction}>
                <Button variant="secondary" type="submit">Sign out</Button>
              </form>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 pb-32 sm:px-6 sm:py-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/95 shadow-[0_-8px_24px_rgba(53,23,29,0.08)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
        <div className="flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-navy"
            >
              <item.icon className="size-5" aria-hidden />
              <span className="max-w-[4.25rem] truncate">{item.mobileLabel}</span>
            </Link>
          ))}
        </div>
      </nav>
      <Link
        href="/dashboard#campus-chatbot"
        aria-label="Open campus chatbot"
        title="Open campus chatbot"
        className="focus-ring fixed bottom-40 right-4 z-30 grid size-14 place-items-center rounded-full bg-primary text-white shadow-lg shadow-red-200 transition hover:bg-red-800 sm:right-5 lg:bottom-24"
      >
        <MessageCircle className="size-6" aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-green-500" aria-hidden />
      </Link>
    </div>
  );
}
