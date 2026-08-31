"use client";

import type { Room } from "@/lib/api/types";
import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

type Props = { search?: string; status?: string; roomId?: string; dateFrom?: string; dateTo?: string; rooms: Room[]; perPage?: string };

export function BookingFilters({ search, status, roomId, dateFrom, dateTo, rooms, perPage }: Props) {
  const locale = useLocale();
  return (
    <form className="mt-8 grid items-end gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_180px_180px_150px_150px_auto]" method="get">
      <input type="hidden" name="per_page" value={perPage} />
      <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">{localize(locale, "Cari booking", "Search bookings")}</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Kode, nama, email, atau telepon", "Code, name, email, or phone")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">{localize(locale, "Filter status", "Filter by status")}</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="pending">{localize(locale, "Menunggu", "Pending")}</option><option value="confirmed">{localize(locale, "Dikonfirmasi", "Confirmed")}</option><option value="checked_in">{localize(locale, "Check-in", "Checked in")}</option><option value="checked_out">{localize(locale, "Check-out", "Checked out")}</option><option value="cancelled">{localize(locale, "Dibatalkan", "Cancelled")}</option></select></label>
      <label><span className="sr-only">{localize(locale, "Filter kamar", "Filter by room")}</span><select name="room_id" defaultValue={roomId ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua kamar", "All rooms")}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">{localize(locale, "Mulai · TT/BB/TTTT", "Start · MM/DD/YYYY")}</span><input name="date_from" type="date" defaultValue={dateFrom} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <label><span className="mb-1.5 block text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">{localize(locale, "Akhir · TT/BB/TTTT", "End · MM/DD/YYYY")}</span><input name="date_to" type="date" defaultValue={dateTo} className="h-12 w-full rounded-sm border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 xl:col-span-1">{localize(locale, "Terapkan", "Apply")}</button>
    </form>
  );
}
