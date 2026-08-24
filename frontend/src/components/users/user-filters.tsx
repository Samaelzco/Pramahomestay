"use client";

import { SearchIcon } from "@/components/ui/icons";
import type { AccessRole } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";

export function UserFilters({ search, role, isActive, roles }: { search?: string; role?: string; isActive?: string; roles: AccessRole[] }) {
  const locale = useLocale();
  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_190px_190px_auto]">
    <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">{localize(locale, "Cari user", "Search users")}</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Cari nama atau email", "Search name or email")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">{localize(locale, "Filter role", "Filter by role")}</span><select name="role" defaultValue={role ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua role", "All roles")}</option>{roles.map((item) => <option key={item.name} value={item.name}>{item.label}</option>)}</select></label>
    <label><span className="sr-only">{localize(locale, "Filter status", "Filter by status")}</span><select name="is_active" defaultValue={isActive ?? ""} className="h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary"><option value="">{localize(locale, "Semua status", "All statuses")}</option><option value="1">{localize(locale, "Aktif", "Active")}</option><option value="0">{localize(locale, "Nonaktif", "Inactive")}</option></select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 lg:col-span-1">{localize(locale, "Terapkan", "Apply")}</button>
  </form>;
}
