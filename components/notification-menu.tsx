"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Inbox, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/supabase/user-sync";
import { cn } from "@/lib/utils";

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  useEffect(() => {
    let isActive = true;
    let cleanup: (() => void) | undefined;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteNotifications, subscribeToRemoteNotifications }) => {
      const loadedNotifications = await loadRemoteNotifications();
      if (isActive) setNotifications(loadedNotifications);

      const unsubscribe = await subscribeToRemoteNotifications((notification) => {
        setNotifications((currentNotifications) => [
          notification,
          ...currentNotifications.filter((currentNotification) => currentNotification.id !== notification.id)
        ].slice(0, 20));
        setToast(notification);
        window.setTimeout(() => {
          setToast((currentToast) => (currentToast?.id === notification.id ? null : currentToast));
        }, 6000);
      });

      if (isActive) {
        cleanup = unsubscribe;
      } else {
        unsubscribe();
      }
    });

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, []);

  async function markRead(notificationIds?: string[]) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        !notificationIds || notificationIds.includes(notification.id) ? { ...notification, isRead: true } : notification
      )
    );

    const { markRemoteNotificationsRead } = await import("@/lib/supabase/user-sync");
    await markRemoteNotificationsRead(notificationIds);
  }

  function handleNotificationOpen(notification: AppNotification) {
    setOpen(false);
    setToast(null);
    if (!notification.isRead) void markRead([notification.id]);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        aria-label="Notifications"
        aria-expanded={open}
        className="relative size-10 border border-white/10 bg-white/[0.05] px-0 text-foreground shadow-none transition hover:bg-white/[0.09]"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="size-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-5 text-white" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {toast && (
        <Link
          href={toast.href}
          className="focus-ring glass-panel fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4"
          onClick={() => handleNotificationOpen(toast)}
        >
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-accent">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{toast.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{toast.body}</p>
            </div>
          </div>
        </Link>
      )}

      {open && (
        <div className="glass-panel absolute right-0 top-12 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-3 sm:w-96">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold text-foreground">Notifications</p>
            <button
              type="button"
              className="focus-ring rounded-lg px-2 py-1 text-xs font-black text-accent transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={unreadCount === 0}
              onClick={() => void markRead()}
            >
              {unreadCount === 0 ? "Read" : "Mark read"}
            </button>
          </div>
          <div className="grid max-h-[28rem] gap-2 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <Inbox className="mx-auto size-6 text-primary" aria-hidden />
                <p className="mt-2 text-sm font-semibold text-foreground">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">No notifications right now.</p>
              </div>
            )}
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                className={cn(
                  "focus-ring rounded-2xl border border-white/10 p-3 transition hover:bg-white/[0.06]",
                  !notification.isRead && "bg-primary/10"
                )}
                onClick={() => handleNotificationOpen(notification)}
              >
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                      {!notification.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{notification.body}</p>
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
