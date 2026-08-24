"use client";

import { SearchIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";

export function GuestFilters({ search, isActive }: { search?: string; isActive?: string }) {
  const locale = useLocale();
  return <form className="mt-8 grid gap-3 border-y py-5 sm:grid-cols-[1fr_180px_auto]" method="get">
    <label className="relative"><span className="sr-only">{localize(locale, "Cari tamu", "Search guests")}</span><SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Cari nama, email, atau nomor telepon", "Search name, email, or phone number")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">{localize(locale, "Filter status profil", "Filter profile status")}</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua profil", "All profiles")}</option><option value="1">{localize(locale, "Aktif", "Active")}</option><option value="0">{localize(locale, "Nonaktif", "Inactive")}</option></select></label>
    <button type="submit" className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131]">{localize(locale, "Terapkan", "Apply")}</button>
  </form>;
}
