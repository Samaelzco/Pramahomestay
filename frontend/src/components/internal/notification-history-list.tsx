import { openInternalNotificationAction } from "@/app/internal/(dashboard)/notifications/actions";
import { CalendarIcon, OperationsIcon, WalletIcon } from "@/components/ui/icons";
import type { InternalNotification, InternalNotificationType } from "@/lib/api/types";
import { localeCode, type ServerLocale } from "@/lib/locale-server";

const notificationIcons = {
  booking_created: CalendarIcon,
  payment_proof_submitted: WalletIcon,
  check_in_due: OperationsIcon,
  check_out_due: OperationsIcon,
} satisfies Record<InternalNotificationType, typeof CalendarIcon>;

export function NotificationHistoryList({
  notifications,
  locale,
  timezone,
}: {
  notifications: InternalNotification[];
  locale: ServerLocale;
  timezone: string;
}) {
  const date = new Intl.DateTimeFormat(localeCode(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  });

  return (
    <div className="mt-5 overflow-hidden bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[56px_180px_1fr_180px] items-center gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid">
        <span />
        <span>{locale === "en" ? "Category" : "Kategori"}</span>
        <span>{locale === "en" ? "Notification" : "Notifikasi"}</span>
        <span>{locale === "en" ? "Time" : "Waktu"}</span>
      </div>
      <div className="divide-y">
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type];
          return (
            <form key={notification.id} action={openInternalNotificationAction.bind(null, notification.id)}>
              <button
                type="submit"
                className={`grid w-full min-w-0 gap-4 px-5 py-5 text-left transition-colors hover:bg-surface-low focus-visible:bg-surface-low sm:grid-cols-[48px_1fr] lg:grid-cols-[56px_180px_1fr_180px] lg:items-center lg:gap-5 lg:px-6 ${notification.is_read ? "" : "bg-secondary-soft/35"}`}
              >
                <span className={`grid size-11 place-items-center rounded-md ${notification.is_read ? "bg-surface-low text-muted" : "bg-secondary-soft text-secondary"}`}>
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">
                    {locale === "en" ? "Category" : "Kategori"}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-sm font-semibold lg:mt-0">
                    {locale === "en"
                      ? ({
                          booking_created: "New booking",
                          payment_proof_submitted: "Payment proof",
                          check_in_due: "Check-in",
                          check_out_due: "Check-out",
                        } as const)[notification.type]
                      : notification.type_label}
                    {!notification.is_read && <span className="size-2 rounded-full bg-secondary" aria-label={locale === "en" ? "Unread" : "Belum dibaca"} />}
                  </span>
                </span>
                <span className="min-w-0 sm:col-start-2 lg:col-start-auto">
                  <span className={`block text-sm ${notification.is_read ? "font-medium" : "font-semibold"}`}>
                    {locale === "en" ? notification.title_en : notification.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {locale === "en" ? notification.message_en : notification.message}
                  </span>
                </span>
                <span className="sm:col-start-2 lg:col-start-auto">
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">
                    {locale === "en" ? "Time" : "Waktu"}
                  </span>
                  <span className="mt-1 block text-sm text-muted tabular-nums lg:mt-0">{date.format(new Date(notification.created_at))}</span>
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
