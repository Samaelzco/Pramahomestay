"use client";

import { cancelBookingAction, deleteBookingAction } from "@/app/internal/(dashboard)/bookings/actions";
import { BookingStatusBadge } from "@/components/bookings/booking-status";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Booking } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const formatDate = (value: string) => date.format(new Date(`${value}T00:00:00`));
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_1.2fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid">
        <span>Booking</span><span>{localize(locale, "Tamu", "Guest")}</span><span>{localize(locale, "Kamar", "Room")}</span><span>{localize(locale, "Menginap", "Stay")}</span><span>Total</span><span>{localize(locale, "Aksi", "Actions")}</span>
      </div>
      <div className="divide-y">
        {bookings.map((booking) => (
          <article key={booking.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr_1.2fr_0.8fr_auto] lg:items-center lg:px-6">
            <div><p className="text-sm font-semibold tabular-nums">{booking.booking_code}</p><div className="mt-2"><BookingStatusBadge status={booking.status} label={booking.status_label} /></div></div>
            <div><p className="font-semibold">{booking.guest_name}</p><p className="mt-1 truncate text-sm text-muted">{booking.guest_phone}</p></div>
            <div><p className="text-sm font-semibold">{booking.room.name}</p><p className="mt-1 text-xs text-muted">{booking.guest_count} {localize(locale, "tamu", booking.guest_count === 1 ? "guest" : "guests")}</p></div>
            <div><p className="text-sm font-medium">{formatDate(booking.check_in)}</p><p className="mt-1 text-xs text-muted">{localize(locale, "hingga", "to")} {formatDate(booking.check_out)} · {booking.total_nights} {localize(locale, "malam", booking.total_nights === 1 ? "night" : "nights")}</p></div>
            <div><p className="text-sm font-semibold tabular-nums">{currency.format(Number(booking.total_amount))}</p><p className="mt-1 text-xs text-muted">{localize(locale, "Total booking", "Booking total")}</p></div>
            <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
              <Link href={`/internal/bookings/${booking.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">{localize(locale, "Lihat detail", "View details")}</Link>
              {["pending", "confirmed"].includes(booking.status) && <ConfirmAction action={cancelBookingAction.bind(null, booking.id)} trigger={localize(locale, "Batalkan", "Cancel")} title={localize(locale, `Batalkan ${booking.booking_code}?`, `Cancel ${booking.booking_code}?`)} description={localize(locale, "Kamar akan dilepas dari jadwal. Booking tetap tersimpan sebagai riwayat dan tidak dapat dikembalikan lewat aksi ini.", "The room will be released from the schedule. The booking remains in history and cannot be restored through this action.")} confirmLabel={localize(locale, "Ya, batalkan", "Yes, cancel")} reason={{ label: localize(locale, "Alasan pembatalan · opsional", "Cancellation reason · optional"), placeholder: localize(locale, "Contoh: tamu mengubah jadwal", "Example: guest changed their schedule") }} />}
              <ConfirmAction action={deleteBookingAction.bind(null, booking.id)} trigger={localize(locale, "Hapus", "Delete")} title={localize(locale, `Hapus ${booking.booking_code}?`, `Delete ${booking.booking_code}?`)} description={localize(locale, "Booking akan dihapus dari daftar operasional. Aksi ini hanya tersedia karena statusnya masih menunggu atau dibatalkan dan belum memiliki pembayaran.", "The booking will be removed from the operational list. This is only available because it is pending or cancelled and has no payments.")} confirmLabel={localize(locale, "Ya, hapus booking", "Yes, delete booking")} disabled={!booking.can_delete} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
