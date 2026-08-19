import { cancelBookingAction } from "@/app/internal/(dashboard)/bookings/actions";
import { BookingStatusBadge } from "@/components/bookings/booking-status";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Booking } from "@/lib/api/types";
import Link from "next/link";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const formatDate = (value: string) => date.format(new Date(`${value}T00:00:00`));

export function BookingList({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_1.2fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid">
        <span>Booking</span><span>Tamu</span><span>Kamar</span><span>Menginap</span><span>Total</span><span>Aksi</span>
      </div>
      <div className="divide-y">
        {bookings.map((booking) => (
          <article key={booking.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr_1.2fr_0.8fr_auto] lg:items-center lg:px-6">
            <div><p className="text-sm font-semibold tabular-nums">{booking.booking_code}</p><div className="mt-2"><BookingStatusBadge status={booking.status} label={booking.status_label} /></div></div>
            <div><p className="font-semibold">{booking.guest_name}</p><p className="mt-1 truncate text-sm text-muted">{booking.guest_phone}</p></div>
            <div><p className="text-sm font-semibold">{booking.room.name}</p><p className="mt-1 text-xs text-muted">{booking.room.type_label} · {booking.guest_count} tamu</p></div>
            <div><p className="text-sm font-medium">{formatDate(booking.check_in)}</p><p className="mt-1 text-xs text-muted">hingga {formatDate(booking.check_out)} · {booking.total_nights} malam</p></div>
            <div><p className="text-sm font-semibold tabular-nums">{currency.format(Number(booking.total_amount))}</p><p className="mt-1 text-xs text-muted">Total booking</p></div>
            <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
              <Link href={`/internal/bookings/${booking.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">Lihat detail</Link>
              {["pending", "confirmed"].includes(booking.status) && <ConfirmAction action={cancelBookingAction.bind(null, booking.id)} trigger="Batalkan" title={`Batalkan ${booking.booking_code}?`} description="Kamar akan dilepas dari jadwal. Booking tetap tersimpan sebagai riwayat dan tidak dapat dikembalikan lewat aksi ini." confirmLabel="Ya, batalkan" reason={{ label: "Alasan pembatalan · opsional", placeholder: "Contoh: tamu mengubah jadwal" }} />}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
