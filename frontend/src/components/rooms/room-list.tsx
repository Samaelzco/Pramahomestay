"use client";

import { deleteRoomAction, setRoomActivationAction } from "@/app/internal/(dashboard)/rooms/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Room } from "@/lib/api/types";
import { amenityName, localize, useLocale, type Locale } from "@/lib/locale";
import Link from "next/link";

const statusStyle = {
  ready: "bg-[#edf4ef] text-[#28533b]",
  occupied: "bg-[#e8edf4] text-[#304d72]",
  cleaning: "bg-[#f4ede3] text-[#68491f]",
  maintenance: "bg-[#ffdad6] text-[#93000a]",
};

const operationalCopy = {
  ready: ["Siap menerima booking", "Ready for bookings"],
  occupied: ["Sedang digunakan tamu", "Currently occupied"],
  cleaning: ["Pembersihan berlangsung", "Cleaning in progress"],
  maintenance: ["Tidak tersedia untuk booking", "Unavailable for bookings"],
};

const statusLabels = { ready: ["Siap", "Ready"], occupied: ["Terisi", "Occupied"], cleaning: ["Dibersihkan", "Cleaning"], maintenance: ["Perawatan", "Maintenance"] };

function RoomStatus({ room, locale }: { room: Room; locale: Locale }) {
  const label = statusLabels[room.status];
  return <span className={`inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${statusStyle[room.status]}`}>{localize(locale, label[0], label[1])}</span>;
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  return (
    <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
      <div className="hidden grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid">
        <span>{localize(locale, "Kamar", "Room")}</span><span>{localize(locale, "Detail", "Details")}</span><span>Status</span><span>{localize(locale, "Kapasitas", "Capacity")}</span><span>{localize(locale, "Tarif", "Rate")}</span><span>{localize(locale, "Aksi", "Actions")}</span>
      </div>
      <div className="divide-y">
        {rooms.map((room) => (
          <article key={room.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] lg:items-center lg:px-6">
            <div><p className="font-semibold">{room.name}</p><p className="mt-1 text-xs text-muted">{room.is_active ? localize(locale, "Aktif di inventori", "Active in inventory") : localize(locale, "Dinonaktifkan", "Inactive")}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Fasilitas", "Amenities")}</p><p className="mt-1 text-sm font-medium lg:mt-0">{room.amenities.length} {localize(locale, "fasilitas", room.amenities.length === 1 ? "amenity" : "amenities")}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{room.amenities.map((item) => amenityName(item, locale)).join(", ") || localize(locale, "Belum dipilih", "None selected")}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Status</p><div className="mt-2 lg:mt-0"><RoomStatus room={room} locale={locale} /></div><p className="mt-2 text-xs text-muted">{localize(locale, operationalCopy[room.status][0], operationalCopy[room.status][1])}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Kapasitas", "Capacity")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{room.capacity} {localize(locale, "tamu", room.capacity === 1 ? "guest" : "guests")}</p><p className="mt-1 text-xs text-muted">{room.bed_count} {localize(locale, "tempat tidur", room.bed_count === 1 ? "bed" : "beds")}</p></div>
            <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Tarif", "Rate")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(room.price_per_night))}</p><p className="mt-1 text-xs text-muted">{localize(locale, "per malam", "per night")}</p></div>
            <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
              <Link href={`/internal/rooms/${room.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">{localize(locale, "Edit detail", "Edit details")}</Link>
              <ConfirmAction action={setRoomActivationAction.bind(null, room.id, !room.is_active)} trigger={room.is_active ? localize(locale, "Nonaktifkan", "Deactivate") : localize(locale, "Aktifkan", "Activate")} title={room.is_active ? localize(locale, `Nonaktifkan ${room.name}?`, `Deactivate ${room.name}?`) : localize(locale, `Aktifkan ${room.name}?`, `Activate ${room.name}?`)} description={room.is_active ? localize(locale, "Kamar tidak muncul sebagai pilihan untuk booking baru. Booking yang sudah tercatat tetap tersimpan.", "The room will no longer appear for new bookings. Existing bookings remain intact.") : localize(locale, "Kamar kembali tersedia dalam alur booking baru sesuai status operasionalnya.", "The room becomes available for new bookings according to its operational status.")} confirmLabel={room.is_active ? localize(locale, "Ya, nonaktifkan", "Yes, deactivate") : localize(locale, "Ya, aktifkan", "Yes, activate")} tone={room.is_active ? "danger" : "primary"} />
              <ConfirmAction action={deleteRoomAction.bind(null, room.id)} trigger={localize(locale, "Hapus", "Delete")} title={localize(locale, `Hapus ${room.name}?`, `Delete ${room.name}?`)} description={localize(locale, "Kamar akan dihapus dari inventori aktif. Aksi ini hanya tersedia karena kamar belum memiliki riwayat booking.", "The room will be removed from active inventory. This action is only available because it has no booking history.")} confirmLabel={localize(locale, "Ya, hapus kamar", "Yes, delete room")} disabled={!room.can_delete} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
