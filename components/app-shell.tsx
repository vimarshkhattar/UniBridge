import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { AppNavLink } from "@/components/app-nav-link";
import type { AppNavIconName } from "@/components/app-nav-link";
import { AppTopbarTitle } from "@/components/app-topbar-title";
import { Logo } from "@/components/logo";
import { NotificationMenu } from "@/components/notification-menu";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  iconName: AppNavIconName;
};

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", iconName: "dashboard" },
  { href: "/discover", label: "Discover", mobileLabel: "Discover", iconName: "discover" },
  { href: "/connections", label: "Connections", mobileLabel: "Connections", iconName: "connections" },
  { href: "/events", label: "Events", mobileLabel: "Events", iconName: "events" }
];

const resourceNav: NavItem[] = [
  { href: "/assistant", label: "Communication Helper", mobileLabel: "Helper", iconName: "assistant" },
  { href: "/guides", label: "Guides", mobileLabel: "Guides", iconName: "guides" }
];

const accountNav: NavItem[] = [
  { href: "/profile", label: "Profile", mobileLabel: "Profile", iconName: "profile" },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", iconName: "settings" }
];

const mobileNav = [mainNav[0], mainNav[1], mainNav[3], resourceNav[0], resourceNav[1], mainNav[2], accountNav[0], accountNav[1]];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="grid gap-2">
      <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
      {items.map((item) => (
        <AppNavLink key={item.href} {...item} />
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-dark-shell min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-80 flex-col border-r border-white/10 bg-[#0a0c11]/95 p-5 backdrop-blur-xl lg:flex">
        <div className="mesh-glow absolute inset-0 opacity-70" aria-hidden />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <Logo href="/dashboard" />
        <form action="/discover" className="mt-7 rounded-3xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-2 text-muted-foreground transition focus-within:bg-black/35 focus-within:text-foreground">
            <button
              type="submit"
              aria-label="Search UniBridge"
              className="rounded-full text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="size-4" aria-hidden />
            </button>
            <input
              name="q"
              type="search"
              aria-label="Search students, events, and guides"
              placeholder="Search students, events, guides"
              className="min-w-0 flex-1 bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>
          <nav className="mt-8 grid min-h-0 flex-1 gap-7 overflow-y-auto pb-4 pr-1" aria-label="Application navigation">
            <NavSection title="Main" items={mainNav} />
            <NavSection title="Resources" items={resourceNav} />
            <NavSection title="Account" items={accountNav} />
          </nav>
        </div>
        <div className="sidebar-promo-card glass-panel relative z-10 mt-4 shrink-0 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary/20 text-sm font-black text-white">UB</span>
            <div>
              <p className="text-sm font-black text-foreground">UniBridge</p>
              <p className="text-xs font-semibold text-muted-foreground">Campus connection space</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Discover classmates, plan events, and keep conversations moving without the awkward guesswork.
          </p>
        </div>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Logo href="/" />
            </div>
            <div className="hidden lg:block">
              <AppTopbarTitle />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <NotificationMenu />
              <form action={signOutAction}>
                <Button
                  variant="secondary"
                  type="submit"
                  className="border-white/10 bg-white/[0.06] text-foreground hover:bg-white/[0.1]"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-5 pb-32 sm:px-6 sm:py-7 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/90 shadow-[0_-24px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileNav.map((item) => (
            <AppNavLink key={item.href} {...item} mobile />
          ))}
        </div>
      </nav>

      <Link
        href="/dashboard#campus-chatbot"
        aria-label="Open campus chatbot"
        title="Open campus chatbot"
        className="focus-ring bg-brand-gradient shadow-glow fixed bottom-28 right-4 z-30 grid size-14 place-items-center rounded-full text-white transition hover:scale-105 sm:right-5 lg:bottom-6"
      >
        <MessageCircle className="size-6" aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-background bg-green-500" aria-hidden />
      </Link>
    </div>
  );
}
