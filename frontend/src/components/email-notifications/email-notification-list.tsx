"use client";

import type { EmailNotification } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";

const tones = { queued: "bg-secondary-soft text-secondary", sent: "bg-[#edf4ef] text-[#28533b]", failed: "bg-[#ffdad6] text-[#93000a]" } as const;

export function EmailNotificationList({ notifications }: { notifications: EmailNotification[] }) {
  const locale = useLocale();
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { dateStyle: "medium", timeStyle: "short" });
  return <div className="mt-5 overflow-hidden bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.15fr_1.2fr_1fr_0.7fr_0.85fr] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>{localize(locale, "Notifikasi", "Notification")}</span><span>{localize(locale, "Penerima", "Recipient")}</span><span>Booking</span><span>Status</span><span>{localize(locale, "Waktu", "Time")}</span></div>
    <div className="divide-y">{notifications.map((item) => <article key={item.id} className="grid min-w-0 gap-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.2fr_1fr_0.7fr_0.85fr] lg:items-center lg:px-6">
      <div className="min-w-0"><p className="font-semibold">{locale === "en" ? ({ booking_created: "Booking created", payment_proof_submitted: "Receipt received", payment_verified: "Payment verified", payment_rejected: "Payment rejected", booking_cancelled: "Booking cancelled", payment_expired: "Payment expired" } as const)[item.type] : item.type_label}</p><p className="mt-1 truncate text-sm text-muted">{item.subject}</p></div>
      <div className="min-w-0"><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">{localize(locale, "Penerima", "Recipient")}</p><p className="mt-1 truncate text-sm font-semibold lg:mt-0">{item.recipient_name}</p><p className="mt-1 truncate text-xs text-muted">{item.recipient_email}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">Booking</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{item.booking_code ?? "—"}</p><p className="mt-1 text-xs text-muted">{item.payment_code ?? "—"}</p></div>
      <div><span className={`inline-flex px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase ${tones[item.status]}`}>{locale === "en" ? ({ queued: "Queued", sent: "Sent", failed: "Failed" } as const)[item.status] : item.status_label}</span>{item.status === "failed" && <p className="mt-2 text-xs text-danger">{localize(locale, `${item.attempts} percobaan`, `${item.attempts} attempts`)}</p>}</div>
      <div><p className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase lg:hidden">{localize(locale, "Waktu", "Time")}</p><p className="mt-1 text-sm tabular-nums lg:mt-0">{date.format(new Date(item.sent_at ?? item.failed_at ?? item.queued_at ?? item.created_at))}</p></div>
      {item.error_message && <p className="text-sm leading-6 text-danger sm:col-span-2 lg:col-span-5">{localize(locale, "Kesalahan terakhir", "Last error")}: {item.error_message}</p>}
    </article>)}</div>
  </div>;
}
