"use client";

import { deleteGuestAction, setGuestActivationAction } from "@/app/internal/(dashboard)/guests/actions";
import { ConfirmAction } from "@/components/ui/confirm-action";
import type { Guest } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";
import Link from "next/link";

export function GuestList({ guests }: { guests: Guest[] }) {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const date = (value: string) => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
  return <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
    <div className="hidden grid-cols-[1.15fr_1.25fr_0.75fr_0.9fr_0.85fr_auto] gap-5 border-b bg-surface-low px-6 py-4 text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:grid"><span>{localize(locale, "Tamu", "Guest")}</span><span>{localize(locale, "Kontak", "Contact")}</span><span>{localize(locale, "Riwayat", "History")}</span><span>{localize(locale, "Nilai booking", "Booking value")}</span><span>{localize(locale, "Terakhir", "Latest")}</span><span>{localize(locale, "Aksi", "Actions")}</span></div>
    <div className="divide-y">{guests.map((guest) => <article key={guest.id} className="grid gap-5 px-5 py-6 transition-colors hover:bg-surface-low/60 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.25fr_0.75fr_0.9fr_0.85fr_auto] lg:items-center lg:px-6">
      <div><p className="font-semibold">{guest.full_name}</p><p className="mt-1 text-xs text-muted">{guest.is_active ? localize(locale, `Profil aktif #${guest.id}`, `Active profile #${guest.id}`) : localize(locale, `Dinonaktifkan #${guest.id}`, `Inactive #${guest.id}`)}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">Kontak</p><a href={`mailto:${guest.email}`} className="mt-1 block truncate text-sm font-medium hover:text-secondary lg:mt-0">{guest.email}</a><a href={`tel:${guest.phone}`} className="mt-1 block text-xs text-muted hover:text-secondary">{guest.phone}</a></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Riwayat", "History")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{guest.stats.bookings} {localize(locale, "booking", "bookings")}</p><p className="mt-1 text-xs text-muted">{guest.stats.completed_stays} {localize(locale, "selesai", "completed")}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Nilai booking", "Booking value")}</p><p className="mt-1 text-sm font-semibold tabular-nums lg:mt-0">{currency.format(Number(guest.stats.total_booking_value))}</p><p className="mt-1 text-xs text-muted">{localize(locale, "Akumulasi reservasi", "Total reservation value")}</p></div>
      <div><p className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase lg:hidden">{localize(locale, "Terakhir", "Latest")}</p><p className="mt-1 text-sm font-medium lg:mt-0">{guest.stats.latest_check_in ? date(guest.stats.latest_check_in) : localize(locale, "Belum menginap", "No stays yet")}</p></div>
      <div className="flex flex-wrap items-center gap-x-4 lg:flex-col lg:items-start">
        <Link href={`/internal/guests/${guest.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-secondary underline decoration-transparent underline-offset-4 hover:decoration-current">{localize(locale, "Lihat profil", "View profile")}</Link>
        <ConfirmAction action={setGuestActivationAction.bind(null, guest.id, !guest.is_active)} trigger={guest.is_active ? "Nonaktifkan" : "Aktifkan"} title={guest.is_active ? `Nonaktifkan ${guest.full_name}?` : `Aktifkan ${guest.full_name}?`} description={guest.is_active ? "Profil tidak dapat dipilih untuk booking baru. Riwayat dan booking yang sudah ada tetap tersimpan." : "Profil kembali dapat dipilih saat membuat booking baru."} confirmLabel={guest.is_active ? "Ya, nonaktifkan" : "Ya, aktifkan"} tone={guest.is_active ? "danger" : "primary"} />
        <ConfirmAction action={deleteGuestAction.bind(null, guest.id)} trigger={localize(locale, "Hapus", "Delete")} title={localize(locale, `Hapus ${guest.full_name}?`, `Delete ${guest.full_name}?`)} description={localize(locale, "Profil akan dihapus dari daftar tamu. Aksi ini hanya tersedia karena profil belum memiliki riwayat booking.", "The profile will be removed from the guest list. This action is only available because it has no booking history.")} confirmLabel={localize(locale, "Ya, hapus profil", "Yes, delete profile")} disabled={!guest.can_delete} />
      </div>
    </article>)}</div>
  </div>;
}
