"use client";

import {
  getInternalNotificationSummaryAction,
  markAllInternalNotificationsReadAction,
  openInternalNotificationAction,
} from "@/app/internal/(dashboard)/notifications/actions";
import { BellIcon, CalendarIcon, OperationsIcon, WalletIcon } from "@/components/ui/icons";
import type { InternalNotification, InternalNotificationSummary, InternalNotificationType } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import { getRealtimeEcho } from "@/lib/realtime/echo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const notificationIcons = {
  booking_created: CalendarIcon,
  payment_proof_submitted: WalletIcon,
  check_in_due: OperationsIcon,
  check_out_due: OperationsIcon,
} satisfies Record<InternalNotificationType, typeof BellIcon>;

function NotificationRow({ notification, timezone }: { notification: InternalNotification; timezone: string }) {
  const locale = useLocale();
  const Icon = notificationIcons[notification.type];
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(notification.created_at));

  return (
    <form action={openInternalNotificationAction.bind(null, notification.id)}>
      <button type="submit" className="group grid w-full grid-cols-[40px_1fr] gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-low focus-visible:bg-surface-low">
        <span className={`grid size-10 place-items-center rounded-md ${notification.is_read ? "bg-surface-low text-muted" : "bg-secondary-soft text-secondary"}`}>
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="flex items-start gap-2">
            <span className={`min-w-0 flex-1 text-sm ${notification.is_read ? "font-medium" : "font-semibold"}`}>
              {locale === "en" ? notification.title_en : notification.title}
            </span>
            {!notification.is_read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" aria-label={localize(locale, "Belum dibaca", "Unread")} />}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted">
            {locale === "en" ? notification.message_en : notification.message}
          </span>
          <span className="mt-2 block text-[11px] font-medium text-muted tabular-nums">{date}</span>
        </span>
      </button>
    </form>
  );
}

type RealtimePayload = { notification?: InternalNotification };

export function NotificationCenter({ userId, initialSummary }: { userId: number; initialSummary: InternalNotificationSummary }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await getInternalNotificationSummaryAction());
    } catch {}
  }, []);

  useEffect(() => {
    const realtime = getRealtimeEcho();
    if (!realtime) return;

    const channelName = `internal-users.${userId}`;
    const channel = realtime.private(channelName);
    const unsubscribeConnection = realtime.connector.onConnectionChange((status) => {
      if (status !== "connected") return;
      void refreshSummary();
    });

    channel.listen(".internal.notification.created", (payload: RealtimePayload) => {
      const notification = payload.notification;
      if (!notification) return;

      setSummary((current) => {
        if (current.notifications.some((item) => item.id === notification.id)) return current;
        return {
          ...current,
          unread_count: current.unread_count + 1,
          notifications: [notification, ...current.notifications].slice(0, 5),
        };
      });

      if (pathname.startsWith("/internal/notifications")) router.refresh();
    });

    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshSummary();
    };
    window.addEventListener("online", refreshSummary);
    document.addEventListener("visibilitychange", syncWhenVisible);

    return () => {
      unsubscribeConnection();
      window.removeEventListener("online", refreshSummary);
      document.removeEventListener("visibilitychange", syncWhenVisible);
      realtime.leave(channelName);
    };
  }, [pathname, refreshSummary, router, userId]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      startTransition(async () => {
        await refreshSummary();
      });
    }
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllInternalNotificationsReadAction();
      await refreshSummary();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={localize(locale, "Buka notifikasi", "Open notifications")}
        aria-expanded={open}
        aria-controls="internal-notification-panel"
        onClick={toggle}
        className="relative grid size-11 place-items-center rounded-sm border bg-surface text-primary transition-colors hover:bg-surface-low"
      >
        <BellIcon className="size-5" />
        {summary.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] leading-5 font-semibold text-white tabular-nums">
            {summary.unread_count > 99 ? "99+" : summary.unread_count}
          </span>
        )}
        <span className="sr-only" aria-live="polite">
          {localize(locale, `${summary.unread_count} notifikasi belum dibaca`, `${summary.unread_count} unread notifications`)}
        </span>
      </button>

      {open && (
        <section
          id="internal-notification-panel"
          aria-label={localize(locale, "Notifikasi internal", "Internal notifications")}
          className="fixed top-[72px] right-4 left-4 z-40 overflow-hidden rounded-lg bg-surface shadow-[0_22px_60px_-24px_rgba(17,17,17,0.45)] sm:absolute sm:top-[calc(100%+12px)] sm:right-0 sm:left-auto sm:w-[410px]"
        >
          <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">{localize(locale, "Notifikasi", "Notifications")}</h2>
              <p className="mt-0.5 text-xs text-muted">
                {summary.unread_count
                  ? localize(locale, `${summary.unread_count} belum dibaca`, `${summary.unread_count} unread`)
                  : localize(locale, "Semua sudah dibaca", "All caught up")}
              </p>
            </div>
            {summary.unread_count > 0 && (
              <button type="button" disabled={pending} onClick={markAllRead} className="text-xs font-semibold text-secondary underline-offset-4 hover:underline disabled:opacity-50">
                {localize(locale, "Tandai semua dibaca", "Mark all read")}
              </button>
            )}
          </div>

          {summary.notifications.length ? (
            <div className="max-h-[min(60vh,480px)] divide-y overflow-y-auto">
              {summary.notifications.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} timezone={summary.timezone} />
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <BellIcon className="mx-auto size-7 text-muted" />
              <p className="mt-4 text-sm font-semibold">{localize(locale, "Belum ada notifikasi", "No notifications yet")}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{localize(locale, "Aktivitas penting akan muncul di sini.", "Important activity will appear here.")}</p>
            </div>
          )}

          <Link href="/internal/notifications" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center border-t text-sm font-semibold text-secondary transition-colors hover:bg-surface-low">
            {localize(locale, "Lihat semua notifikasi", "View all notifications")}
          </Link>
        </section>
      )}
    </div>
  );
}
