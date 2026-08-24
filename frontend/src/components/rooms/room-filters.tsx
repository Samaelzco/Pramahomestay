"use client";

import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

export function RoomFilters({ search, status, isActive }: { search?: string; status?: string; isActive?: string }) {
  const locale = useLocale();
  return (
    <form className="mt-8 grid gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_190px_190px_auto]" method="get">
      <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">{localize(locale, "Cari kamar", "Search rooms")}</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Cari nama atau deskripsi kamar", "Search room name or description")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
      <label><span className="sr-only">{localize(locale, "Filter status", "Filter by status")}</span><select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="ready">{localize(locale, "Siap", "Ready")}</option><option value="occupied">{localize(locale, "Terisi", "Occupied")}</option><option value="cleaning">{localize(locale, "Dibersihkan", "Cleaning")}</option><option value="maintenance">{localize(locale, "Perawatan", "Maintenance")}</option></select></label>
      <label><span className="sr-only">{localize(locale, "Filter inventori", "Filter inventory")}</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua inventori", "All inventory")}</option><option value="1">{localize(locale, "Aktif", "Active")}</option><option value="0">{localize(locale, "Nonaktif", "Inactive")}</option></select></label>
      <button type="submit" className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">{localize(locale, "Terapkan", "Apply")}</button>
    </form>
  );
}
