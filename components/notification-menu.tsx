"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    title: "New connection request",
    body: "Chen Wei wants to connect as a study partner.",
    href: "/connections"
  },
  {
    title: "Event buddy reminder",
    body: "Students are looking for buddies for the Campus Involvement Fair.",
    href: "/events"
  },
  {
    title: "Profile tip",
    body: "Add a profile photo to reach 100% completion.",
    href: "/profile"
  }
];

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const visibleNotifications = read ? [] : notifications;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        aria-label="Notifications"
        aria-expanded={open}
        className="relative size-10 px-0"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="size-5" aria-hidden />
        {!read && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" aria-hidden />}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-80 rounded-lg border border-border bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold text-navy">Notifications</p>
            <button
              type="button"
              className="focus-ring rounded-sm text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={read}
              onClick={() => setRead(true)}
            >
              {read ? "Read" : "Mark read"}
            </button>
          </div>
          <div className="grid gap-2">
            {visibleNotifications.length === 0 && (
              <div className="rounded-md border border-border bg-muted p-4 text-center">
                <Inbox className="mx-auto size-6 text-primary" aria-hidden />
                <p className="mt-2 text-sm font-semibold text-navy">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">No unread notifications right now.</p>
              </div>
            )}
            {visibleNotifications.map((notification) => (
              <Link
                key={notification.title}
                href={notification.href}
                className="focus-ring rounded-md border border-border p-3 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-navy">{notification.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.body}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
