"use client";

import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

export function AmenityFilters({ search, isActive, perPage }: { search?: string; isActive?: string; perPage?: string }) {
  const locale = useLocale();
  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-[minmax(260px,1fr)_190px_auto]">
    <input type="hidden" name="per_page" value={perPage} />
    <label className="relative"><span className="sr-only">{localize(locale, "Cari fasilitas", "Search amenities")}</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Cari nama atau deskripsi fasilitas", "Search amenity name or description")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">{localize(locale, "Filter status", "Filter by status")}</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="1">{localize(locale, "Aktif", "Active")}</option><option value="0">{localize(locale, "Nonaktif", "Inactive")}</option></select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">{localize(locale, "Terapkan", "Apply")}</button>
  </form>;
}
