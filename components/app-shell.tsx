import Link from "next/link";
import { BookOpen, Bot, CalendarDays, Compass, LayoutDashboard, MessageCircle, Settings, UserRound, UsersRound } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { NotificationMenu } from "@/components/notification-menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/assistant", label: "Communication Helper", icon: Bot },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/connections", label: "Connections", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings }
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
            <div className="lg:hidden"><Logo href="/dashboard" /></div>
            <p className="hidden text-sm font-medium text-muted-foreground lg:block">International student connection and adjustment platform</p>
            <div className="flex items-center gap-2">
              <NotificationMenu />
              <form action={signOutAction}>
                <Button variant="secondary" type="submit">Sign out</Button>
              </form>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-white lg:hidden" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="focus-ring flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-semibold text-muted-foreground">
            <item.icon className="size-5" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/dashboard#campus-chatbot"
        aria-label="Open campus chatbot"
        title="Open campus chatbot"
        className="focus-ring fixed bottom-20 right-5 z-30 grid size-14 place-items-center rounded-full bg-primary text-white shadow-lg shadow-red-200 transition hover:bg-red-800 lg:bottom-6"
      >
        <MessageCircle className="size-6" aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-green-500" aria-hidden />
      </Link>
    </div>
  );
}
