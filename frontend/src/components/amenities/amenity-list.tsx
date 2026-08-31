"use client";

import { deleteAmenityAction, setAmenityActivationAction } from "@/app/internal/(dashboard)/amenities/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Amenity } from "@/lib/api/types";
import { amenityDescription, amenityName, localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function AmenityList({ amenities }: { amenities: Amenity[] }) {
  const locale = useLocale();
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.4fr_0.65fr_0.75fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:grid"><span>{localize(locale, "Fasilitas", "Amenity")}</span><span>Status</span><span>{localize(locale, "Digunakan", "Usage")}</span><span>{localize(locale, "Aksi", "Actions")}</span></div>
    <div className="divide-y">{amenities.map((amenity) => <article key={amenity.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 md:grid-cols-[1.4fr_0.65fr_0.75fr_auto] md:items-center md:px-6">
      <div><p className="font-semibold">{amenityName(amenity, locale)}</p><p className="mt-1 max-w-xl text-sm leading-6 text-muted">{amenityDescription(amenity, locale) || localize(locale, "Tanpa deskripsi", "No description")}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:hidden">Status</p><span className={`mt-1 inline-flex rounded-sm px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase md:mt-0 ${amenity.is_active ? "bg-[#edf4ef] text-[#28533b]" : "bg-surface-high text-muted"}`}>{amenity.is_active ? localize(locale, "Aktif", "Active") : localize(locale, "Nonaktif", "Inactive")}</span></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase md:hidden">{localize(locale, "Digunakan", "Usage")}</p><p className="mt-1 text-sm font-medium tabular-nums md:mt-0">{amenity.room_count} {localize(locale, "kamar", amenity.room_count === 1 ? "room" : "rooms")}</p></div>
      <div className="flex flex-wrap items-center gap-x-4 md:flex-col md:items-start">
        <Link href={`/internal/amenities/${amenity.id}/edit`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">{localize(locale, "Edit", "Edit")}</Link>
        <ConfirmAction action={setAmenityActivationAction.bind(null, amenity.id, !amenity.is_active)} trigger={amenity.is_active ? localize(locale, "Nonaktifkan", "Deactivate") : localize(locale, "Aktifkan", "Activate")} title={`${amenity.is_active ? localize(locale, "Nonaktifkan", "Deactivate") : localize(locale, "Aktifkan", "Activate")} ${amenityName(amenity, locale)}?`} description={amenity.is_active ? localize(locale, "Fasilitas tidak lagi muncul sebagai pilihan untuk kamar baru. Kamar yang sudah memakainya tetap menyimpan fasilitas ini.", "The amenity will no longer appear for new rooms. Rooms already using it keep the amenity.") : localize(locale, "Fasilitas kembali tersedia sebagai pilihan pada form kamar.", "The amenity becomes available in the room form again.")} confirmLabel={amenity.is_active ? localize(locale, "Ya, nonaktifkan", "Yes, deactivate") : localize(locale, "Ya, aktifkan", "Yes, activate")} tone={amenity.is_active ? "danger" : "primary"} />
        <ConfirmAction action={deleteAmenityAction.bind(null, amenity.id)} trigger={localize(locale, "Hapus", "Delete")} title={localize(locale, `Hapus ${amenityName(amenity, locale)}?`, `Delete ${amenityName(amenity, locale)}?`)} description={localize(locale, "Fasilitas akan dihapus permanen dari daftar.", "The amenity will be permanently removed from the list.")} confirmLabel={localize(locale, "Ya, hapus fasilitas", "Yes, delete amenity")} disabled={!amenity.can_delete} />
      </div>
    </article>)}</div>
  </div>;
}
