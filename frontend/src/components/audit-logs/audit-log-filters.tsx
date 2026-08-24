"use client";

import { SearchIcon } from "@/components/ui/icons";
import type { AuditAction, AuditModule } from "@/lib/api/types";
import { localize, useLocale } from "@/lib/locale";

const modules: Array<{ value: AuditModule; label: string }> = [
  { value: "rooms", label: "Kamar" },
  { value: "amenities", label: "Fasilitas" },
  { value: "bookings", label: "Booking" },
  { value: "payments", label: "Pembayaran" },
  { value: "guests", label: "Tamu" },
  { value: "users", label: "User" },
  { value: "roles", label: "Hak akses" },
  { value: "settings", label: "Pengaturan" },
  { value: "reports", label: "Laporan" },
];
const actions: Array<{ value: AuditAction; label: string }> = [
  { value: "created", label: "Ditambahkan" },
  { value: "updated", label: "Diperbarui" },
  { value: "activated", label: "Diaktifkan" },
  { value: "deactivated", label: "Dinonaktifkan" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "refunded", label: "Dikembalikan" },
  { value: "deleted", label: "Dihapus" },
  { value: "exported", label: "Diekspor" },
];

type Props = {
  search?: string;
  module?: string;
  action?: string;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
  actors: Array<{ id: number; name: string }>;
};

export function AuditLogFilters({ search, module, action, actorId, dateFrom, dateTo, actors }: Props) {
  const locale = useLocale();
  const selectClass = "h-12 w-full rounded-sm border bg-surface px-4 text-sm outline-none focus:border-primary";

  return <form className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_170px_200px_auto]">
    <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">{localize(locale, "Cari aktivitas", "Search activity")}</span><SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" /><input name="search" defaultValue={search} placeholder={localize(locale, "Cari target, aktivitas, atau user", "Search target, activity, or user")} className="h-12 w-full rounded-sm border bg-surface pr-4 pl-12 text-sm outline-none focus:border-primary" /></label>
    <label><span className="sr-only">{localize(locale, "Filter modul", "Filter by module")}</span><select name="module" defaultValue={module ?? ""} className={selectClass}><option value="">{localize(locale, "Semua modul", "All modules")}</option>{modules.map((item) => <option key={item.value} value={item.value}>{locale === "en" ? item.value.replace("audit-logs", "Audit logs").replace(/^./, (character) => character.toUpperCase()) : item.label}</option>)}</select></label>
    <label><span className="sr-only">{localize(locale, "Filter aktivitas", "Filter by activity")}</span><select name="action" defaultValue={action ?? ""} className={selectClass}><option value="">{localize(locale, "Semua aktivitas", "All activities")}</option>{actions.map((item) => <option key={item.value} value={item.value}>{locale === "en" ? ({ created: "Created", updated: "Updated", activated: "Activated", deactivated: "Deactivated", cancelled: "Cancelled", refunded: "Refunded", deleted: "Deleted", exported: "Exported" } as Record<string, string>)[item.value] : item.label}</option>)}</select></label>
    <label><span className="sr-only">{localize(locale, "Filter user", "Filter by user")}</span><select name="actor_id" defaultValue={actorId ?? ""} className={selectClass}><option value="">{localize(locale, "Semua user", "All users")}</option>{actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select></label>
    <button className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] sm:col-span-2 xl:col-span-1">{localize(locale, "Terapkan", "Apply")}</button>
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-5 xl:max-w-[560px]">
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{localize(locale, "Dari tanggal", "From date")}<input type="date" name="date_from" defaultValue={dateFrom} className={`${selectClass} mt-2 tabular-nums`} /></label>
      <label className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{localize(locale, "Sampai tanggal", "To date")}<input type="date" name="date_to" defaultValue={dateTo} className={`${selectClass} mt-2 tabular-nums`} /></label>
    </div>
  </form>;
}
